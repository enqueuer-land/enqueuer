import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';

//TODO extract to its own class
type ServerHandler = {
    ports: number[];
    server: any;
};

export class HttpServerPool {
    private static instance: HttpServerPool;
    private app: any;

    private http: ServerHandler = {
        ports: [],
        server: null
    };

    private https: ServerHandler = {
        ports: [],
        server: null
    };

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
            if (!this.http.server) {
                this.initializeExpress();
                Logger.debug(`Creating a new Http server ${port}`);
                const server = http.createServer(this.app);
                this.http.server = server;
            }
            this.http.server.on('error', (err: any) => {
                if (err) {
                    const message = `Error creating http ${err}`;
                    Logger.error(message);
                    return reject(message);
                }
            });
            if (this.http.ports.filter((value) => value == port).length == 0) {
                this.http.server.listen(port, (err: any) => {
                    if (err) {
                        const message = `Error listening http ${err}`;
                        Logger.error(message);
                        return reject(message);
                    }
                    this.http.ports.push(port);
                    return resolve();
                });
            } else {
                this.http.ports.push(port);
                return resolve();
            }
        });
    }
    public getHttpsServer(credentials: any, port: number): Promise<void> {
        Logger.debug(`Getting a Https server ${port}`);
        return new Promise((resolve, reject) => {
            if (!this.https.server) {
                this.initializeExpress();
                Logger.debug(`Creating a new Https server ${port}`);
                const server = https.createServer(credentials, this.app);
                this.https.server = server;
            }
            this.https.server.on('error', (err: any) => {
                if (err) {
                    const message = `Error creating https ${err}`;
                    Logger.error(message);
                    return reject(message);
                }
            });
            if (this.https.ports.filter((value) => value == port).length == 0) {
                this.https.server.listen(port, (err: any) => {
                    if (err) {
                        const message = `Error listening https ${err}`;
                        Logger.error(message);
                        return reject(message);
                    }
                    this.https.ports.push(port);
                    return resolve();
                });
            } else {
                this.https.ports.push(port);
                return resolve();
            }
        });
    }

    private remove(array: number[], element: number) {
        const index = array.indexOf(element);

        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    public closeHttpServer(port: number) {
        Logger.debug(`Releasing http server ${port}:${this.http.ports}`);
        this.remove(this.http.ports, port);
        if (this.http.ports.length == 0 && this.http.server) {
            Logger.debug('Closing http server');
            this.http.server.close();
            this.http.server = null;
            this.finalizeExpress();
        }

    }

    public closeHttpsServer(port: number) {
        Logger.debug(`Releasing https server ${port}:${this.https.ports}`);
        this.remove(this.https.ports, port);
        if (this.https.ports.length == 0 && this.https.server) {
            Logger.debug('Closing https server');
            this.https.server.close();
            this.https.server = null;
            this.finalizeExpress();
        }

    }

    private initializeExpress() {
        if (!this.app) {
            this.app = express();
            this.app.use((req: any, res: any, next: any) => {
                req.setEncoding('utf8');
                req.rawBody = '';
                req.on('data', function (chunk: any) {
                    req.rawBody += chunk;
                });
                req.on('end', function () {
                    Logger.trace(`Http(s) server got message: ${req.rawBody}`);
                    next();
                });
            });
        }
    }

    private finalizeExpress() {
        if (this.http.ports.length + this.https.ports.length <= 0) {
            Logger.trace(`Finalizing express application`);
            this.app = null;
        }
    }

}
