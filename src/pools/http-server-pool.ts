import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';

export class HttpServerPool {
    private static instance: HttpServerPool;
    private ports: any = {};

    public static getInstance(): HttpServerPool {
        if (!HttpServerPool.instance) {
            HttpServerPool.instance = new HttpServerPool();
        }
        return HttpServerPool.instance;
    }

    public getHttpServer(port: number): Promise<any> {
        return new Promise((resolve, reject) => {
            Logger.info(`Getting a Http server ${port}`);
            if (!this.ports[port]) {
                Logger.info(`Creating a new Http server ${port}`);
                const app = this.createApp();
                const server = http.createServer(app);
                this.listenToPort(server, port)
                    .then(() => {
                        this.ports[port] = {
                            app,
                            server
                        };
                        resolve(app);
                    })
                    .catch((err) => reject(err));
            } else {
                resolve(this.ports[port].app);
            }
        });
    }

    public getHttpsServer(credentials: any, port: number): Promise<any> {
        return new Promise((resolve, reject) => {
            Logger.info(`Getting a Https server ${port}`);
            if (!this.ports[port]) {
                Logger.info(`Creating a new Https server ${port}`);
                const app = this.createApp();
                const server = https.createServer(credentials, app);
                this.listenToPort(server, port)
                    .then(() => {
                        this.ports[port] = {
                            app,
                            server
                        };
                        resolve(app);
                    })
                    .catch((err) => reject(err));
            } else {
                resolve(this.ports[port].app);
            }
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

    public closeServer(port: number) {
        const server = this.ports[port];
        if (server) {
            server.server.close();
            Logger.debug(`Server running on ${port} is closed`);
            delete this.ports[port];
            Logger.debug(`Remaining http/s ports: ${Object.keys(this.ports)}`);
        } else {
            Logger.warning(`No server running on ${port} to be closed`);
        }
    }

    private createApp() {
        const app = express();
        app.use((req: any, res: any, next: any) => {
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
        return app;
    }

}
