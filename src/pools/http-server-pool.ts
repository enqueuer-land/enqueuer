import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';

export class HttpServerPool {
    private static instance: HttpServerPool;
    private app: any;

    private boundPorts: boolean[] = [];
    private http: any;
    private https: any;

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
        if (!this.http) {
            Logger.debug(`Creating a new Http server ${port}`);
            const server = http.createServer(this.app);
            this.http = server;
        }
        return this.listenToPort(this.http, port);
    }

    public getHttpsServer(credentials: any, port: number): Promise<void> {
        Logger.debug(`Getting a Https server ${port}`);
        if (!this.https) {
            Logger.debug(`Creating a new Https server ${port}`);
            const server = https.createServer(credentials, this.app);
            this.https = server;
        }
        return this.listenToPort(this.https, port);
    }

    private listenToPort(server: any, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            server.on('error', (err: any) => {
                if (err) {
                    const message = `Error creating server ${err}`;
                    Logger.error(message);
                    return reject(message);
                }
            });
            if (!this.boundPorts[port]) {
                server.listen(port, (err: any) => {
                    if (err) {
                        const message = `Error listening to server ${err}`;
                        Logger.error(message);
                        return reject(message);
                    }
                    this.boundPorts[port] = true;
                    return resolve();
                });
            } else {
                this.boundPorts[port] = true;
                return resolve();
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
