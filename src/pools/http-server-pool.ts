import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';
import * as fs from "fs";

// var options = {
//     key: fs.readFileSync('/path/to/key.pem'),
//     cert: fs.readFileSync('/path/to/cert.pem')
// };
type ServerHandler = {
    counter: number,
    server: any
};

export class HttpServerPool {
    private static instance: HttpServerPool;
    private app: any;

    private http: ServerHandler = {
        counter: 0,
        server: null
    };

    private https: ServerHandler = {
        counter: 0,
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

    public getHttpServer(): http.Server {
        ++this.http.counter;
        if (!this.http.server) {
            this.initializeExpress();
            Logger.debug('Creating a new Http server');
            this.http.server = http.createServer(this.app);
        }
        return this.http.server;
    }

    public getHttpsServer(key: any, cert: any): http.Server {
        ++this.https.counter;
        if (!this.http.server) {
            this.initializeExpress();
            Logger.debug('Creating a new Https server');
            const options = {
                key: key,
                cert: cert
            };

            this.https.server = https.createServer(options, this.app);
        }
        return this.https.server;
    }

    public closeHttpServer() {
        --this.http.counter;
        if (this.http.counter == 0) {
            Logger.debug('Closing http server');
            this.http.server.close();
            this.http.server = null;
            this.finalizeExpress();
        }
    }

    public closeHttpsServer() {
        --this.http.counter;
        if (this.http.counter == 0) {
            Logger.debug('Closing http server');
            this.http.server.close();
            this.http.server = null;
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
        if (this.http.counter + this.https.counter <= 0) {
            this.app = null;
        }
    }

}
