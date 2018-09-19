import {Logger} from '../loggers/logger';
import express from 'express';
import https from 'https';
import http from 'http';
import {HandlerListener} from '../handlers/handler-listener';

//TODO test it
export class HttpContainer {
    private port: number;
    private server: any;
    private app: any;
    private counter: number = 0;
    private sockets: Set<any> = new Set();

    public constructor (port: number, secure: boolean, credentials?: any) {
        this.port = port;
        this.app = this.createApp();
        this.server = this.createServer(secure, credentials);
        this.handleNewSocketConnections();
    }

    public acquire(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                ++this.counter;
                if (this.counter == 1) {
                    this.listenToPort()
                        .then(() => resolve(this.app))
                        .catch((err) => reject(err));
                } else {
                    resolve(this.app);
                }
            } catch (err) {
                reject(err);
            }
        });
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

    private listenToPort(): Promise<void> {
        return new Promise((resolve, reject) => {
            new HandlerListener(this.server)
                .listen(this.port)
                .then(() => {
                    Logger.debug(`Http/s server is listening for clients on ${this.port}`);
                    resolve();
                })
                .catch(err => {
                    const message = `Http/s server could not listen to ${this.port}: ${err}`;
                    Logger.error(message);
                    reject(message);
                });
        });
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