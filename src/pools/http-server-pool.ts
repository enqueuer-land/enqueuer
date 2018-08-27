import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';

export class HttpServerPool {
    private static instance: HttpServerPool;
    private app: any;

    private ports: any = {};

    constructor() {
        this.initializeExpress();
    }

    public static getInstance(): HttpServerPool {
        if (!HttpServerPool.instance) {
            HttpServerPool.instance = new HttpServerPool();
        }
        return HttpServerPool.instance;
    }

    public getApp(): any {
        return this.app;
    }

    public getHttpServer(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.debug(`Getting a Http server ${port}`);
            if (!this.ports[port]) {
                Logger.debug(`Creating a new Http server ${port}`);
                const server = http.createServer(this.app);
                this.listenToPort(server, port)
                    .then(() => {
                        this.ports[port] = server;
                        resolve();
                    })
                    .catch((err) => reject(err));
                this.ports[port] = server;
            }
            resolve();
        });
    }

    public getHttpsServer(credentials: any, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.debug(`Getting a Https server ${port}`);
            if (!this.ports[port]) {
                Logger.debug(`Creating a new Https server ${port}`);
                const server = https.createServer(credentials, this.app);
                this.listenToPort(server, port)
                    .then(() => {
                        this.ports[port] = server;
                        resolve();
                    })
                    .catch((err) => reject(err));
                this.ports[port] = server;
            }
            resolve();
        });
    }

    private listenToPort(server: any, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            server.on('error', (err: any) => {
                if (err) {
                    const message = `Error emitted from server (${port}) ${err}`;
                    Logger.error(message);
                    return reject(message);
                }
            });
            try {
                Logger.info(`Binding server to port ${port}`);
                server.listen(port, (err: any) => {
                    if (err) {
                        const message = `Error listening to port (${port}) ${err}`;
                        Logger.error(message);
                        return reject(message);
                    }
                    return resolve();
                });
            } catch (err) {
                const message = `Error caught from server (${port}) ${err}`;
                Logger.error(message);
                return reject(message);
            }
        });
    }

    private initializeExpress() {
        if (!this.app) {
            this.app = express();
            this.app.use((req: any, res: any, next: any) => {
                req.setEncoding('utf8');
                req.rawBody = '';
                req.on('data', (chunk: any) => {
                    req.rawBody += chunk;
                });
                req.on('end', () => {
                    Logger.trace(`Http(s) server got message: ${req.rawBody}`);
                    next();
                });
            });
        }
    }

}
