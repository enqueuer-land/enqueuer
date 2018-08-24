import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';

type ServerHandler = {
    ports: any;
    server: any;
};

export class HttpServerPool {
    private static instance: HttpServerPool;
    private app: any;

    private http: ServerHandler = {
        ports: {},
        server: null
    };

    private https: ServerHandler = {
        ports: {},
        server: null
    };

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
        Logger.debug(`Getting a Http server ${port}`);
        if (!this.http.server) {
            Logger.debug(`Creating a new Http server ${port}`);
            const server = http.createServer(this.app);
            this.http.server = server;
        }
        return this.listenToPort(this.http, port);
    }

    private listenToPort(server: any, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            server.server.on('error', (err: any) => {
                if (err) {
                    const message = `Error creating server ${err}`;
                    Logger.error(message);
                    return reject(message);
                }
            });
            if (!server.ports[port]) {
                server.server.listen(port, (err: any) => {
                    if (err) {
                        const message = `Error listening to server ${err}`;
                        Logger.error(message);
                        return reject(message);
                    }
                    server.ports[port] = true;
                    return resolve();
                });
            } else {
                server.ports[port] = true;
                return resolve();
            }
        });
    }

    public getHttpsServer(credentials: any, port: number): Promise<void> {
        Logger.debug(`Getting a Https server ${port}`);
        if (!this.https.server) {
            Logger.debug(`Creating a new Https server ${port}`);
            const server = https.createServer(credentials, this.app);
            this.https.server = server;
        }
        return this.listenToPort(this.https, port);
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
