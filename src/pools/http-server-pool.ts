import express from 'express';
import https from 'https';
import http from 'http';
import {Logger} from '../loggers/logger';

export class HttpServerPool {
    private static instance: HttpServerPool;
    private container: any = {};

    public static getInstance(): HttpServerPool {
        if (!HttpServerPool.instance) {
            HttpServerPool.instance = new HttpServerPool();
        }
        return HttpServerPool.instance;
    }

    public getApp(port: number, secure: boolean, credentials?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            Logger.debug(`Getting a Http/s server ${port}`);
            if (!this.container[port]) {
                Logger.info(`Creating a new Http/s server ${port}`);
                const app = this.createApp();
                const server = this.createServer(app, secure, credentials);
                this.listenToPort(server, port)
                    .then(() => {
                        this.container[port] = {
                            app,
                            server,
                            counter: 0,
                            sockets: []
                        };
                        server.on('connection', (socket: any) => {
                            Logger.trace(`Http/s server ${port} got a connection`);
                            this.container[port].sockets.push(socket);
                        });

                        Logger.info(`Http/s server ${port} ready`);
                        resolve(app);
                    })
                    .catch((err) => reject(err));
            } else {
                Logger.trace(`Reusing Http/s server ${port}`);
                ++this.container[port].counter;
                resolve(this.container[port].app);
            }
        });
    }

    public releaseApp(port: number) {
        Logger.trace(`Releasing ${port} http/s container. Using: {${Object.keys(this.container)}}`);
        const container = this.container[port];
        if (container) {
            --container.counter;
            if (container.counter <= 0) {
                Logger.debug(`Closing container running on ${port}. Connections: ${container.sockets.length}`);
                container.sockets.forEach((socket: any) => socket.destroy());
                container.server.close((err: any) => {
                    if (err) {
                        Logger.warning(`Error closing http/s server running on ${port}`);
                        throw err;
                    }
                    Logger.debug(`Container running on ${port} is closed`);
                });
                delete this.container[port];
                Logger.debug(`Remaining http/s containers: ${Object.keys(this.container)}`);
            } else {
                Logger.debug(`No need to close http/s server. Still ${container.counter} using it`);
            }
        } else {
            Logger.warning(`No container running on ${port} to be closed`);
        }
    }

    private createServer(app: any, secure: boolean, credentials?: any): any {
        if (secure) {
            return https.createServer(credentials, app);
        }
        return http.createServer(app);
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
                Logger.trace(`Binding server to port ${port}`);
                server.listen(port, (err: any) => {
                    if (err) {
                        const message = `Error listening to port (${port}) ${err}`;
                        Logger.error(message);
                        return reject(message);
                    }
                    Logger.debug(`Server bound to port ${port}`);
                    return resolve();
                });
            } catch (err) {
                const message = `Error caught from server (${port}) ${err}`;
                Logger.error(message);
                return reject(message);
            }
        });
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
