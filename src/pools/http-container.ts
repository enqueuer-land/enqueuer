import {Logger} from '../loggers/logger';
import express from 'express';
import https from 'https';
import http from 'http';
import {HandlerListener} from '../handlers/handler-listener';

export class HttpContainer {
    private readonly port: number;
    private readonly app: any;
    private server: any;
    private counter: number = 0;
    private sockets: Set<any> = new Set();

    public constructor (port: number, secure: boolean, credentials?: any) {
        this.port = port;
        this.app = this.createApp();
        this.server = this.createServer(secure, credentials);
        this.handleNewSocketConnections();
    }

    public async acquire(): Promise<any> {
        ++this.counter;
        if (this.counter == 1) {
            await new HandlerListener(this.server).listen(this.port);
        }
        return this.app;
    }

    public release(onClose: () => void) {
        --this.counter;
        if (this.counter == 0) {
            Logger.debug(`Closing container ${this.port}`);
            this.sockets.forEach((socket: any) => socket.destroy());
            this.server.close((err: any) => {
                if (err) {
                    throw `Error closing server ${this.port}: ${err}`;
                }
                Logger.debug(`Container ${this.port} is closed`);
                onClose();
            });
        } else if (this.counter < 0) {
            onClose();
        }
    }

    private handleNewSocketConnections() {
        this.server.on('connection', (socket: any) => {
            Logger.trace(`Container ${this.port} got a new connection`);
            this.sockets.add(socket);
            socket.on('close', () => {
                this.sockets.delete(socket);
            });
        });
    }

    private createServer(secure: boolean, credentials?: any): any {
        if (secure) {
            return https.createServer(credentials, this.app);
        }
        return http.createServer(this.app);
    }

    private createApp(): any {
        const app = express();
        app.use((req: any, res: any, next: any) => {
            req.setEncoding('utf8');
            req.rawBody = '';
            req.on('data', (chunk: any) => {
                req.rawBody += chunk;
            });
            req.on('end', () => {
                next();
            });
        });
        return app;
    }

}