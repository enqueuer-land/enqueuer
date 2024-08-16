import { Logger } from '../loggers/logger';
import express from 'express';
import https from 'https';
import http, { Server } from 'http';
import { HandlerListener } from '../handlers/handler-listener';
import * as core from 'express-serve-static-core';

export class HttpContainer {
    private readonly port: number;
    private readonly app: core.Express;
    private server: Server;
    private counter: number = 0;
    private sockets: Set<any> = new Set();
    private listenPromise?: Promise<void>;
    private closePromise?: Promise<any>;

    public constructor(port: number, credentials?: any) {
        this.port = port;
        this.app = this.createApp();
        this.server = this.createServer(credentials);
        this.handleNewSocketConnections();
    }

    public async acquire(): Promise<core.Express> {
        Logger.debug(`Acquiring container ${this.port} (${this.counter})`);
        ++this.counter;
        if (this.counter == 1) {
            if (this.closePromise) {
                await this.closePromise;
            }
            this.listenPromise = new HandlerListener(this.server).listen(this.port);
        }
        await this.listenPromise;
        Logger.trace(`container acquired ${this.port} (${this.counter})`);
        return this.app;
    }

    public async release(): Promise<number> {
        --this.counter;
        Logger.trace(`Releasing container ${this.port} (${this.counter})`);
        if (this.counter == 0) {
            Logger.trace(`Closing container ${this.port}`);
            this.closePromise = new Promise((resolve, reject) => {
                this.sockets.forEach((socket: any) => socket.destroy());
                this.server.close((err: any) => {
                    if (err) {
                        reject(`Error closing server ${this.port}: ${err}`);
                    }
                    Logger.trace(`Container ${this.port} is closed`);
                    resolve(0);
                });
            });
        } else {
            this.closePromise = Promise.resolve();
        }
        await this.closePromise;
        return this.counter;
    }

    private handleNewSocketConnections(): void {
        this.server.on('connection', (socket: any) => {
            Logger.trace(`Container ${this.port} got a new connection`);
            this.sockets.add(socket);
            socket.on('close', () => {
                this.sockets.delete(socket);
            });
        });
    }

    private createServer(credentials?: any): Server {
        if (credentials) {
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
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        });
        return app;
    }
}
