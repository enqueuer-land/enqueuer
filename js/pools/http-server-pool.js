"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("../loggers/logger");
class HttpServerPool {
    constructor() {
        this.container = {};
    }
    static getInstance() {
        if (!HttpServerPool.instance) {
            HttpServerPool.instance = new HttpServerPool();
        }
        return HttpServerPool.instance;
    }
    getApp(port, secure, credentials) {
        return new Promise((resolve, reject) => {
            logger_1.Logger.debug(`Getting a Http/s server ${port}`);
            if (!this.container[port]) {
                logger_1.Logger.info(`Creating a new Http/s server ${port}`);
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
                    server.on('connection', (socket) => {
                        logger_1.Logger.trace(`Http/s server ${port} got a connection`);
                        this.container[port].sockets.push(socket);
                    });
                    logger_1.Logger.info(`Http/s server ${port} ready`);
                    resolve(app);
                })
                    .catch((err) => reject(err));
            }
            else {
                logger_1.Logger.trace(`Reusing Http/s server ${port}`);
                ++this.container[port].counter;
                resolve(this.container[port].app);
            }
        });
    }
    releaseApp(port) {
        logger_1.Logger.trace(`Releasing ${port} http/s container. Using: {${Object.keys(this.container)}}`);
        const container = this.container[port];
        if (container) {
            --container.counter;
            if (container.counter <= 0) {
                logger_1.Logger.debug(`Closing container running on ${port}. Connections: ${container.sockets.length}`);
                // container.sockets.forEach((socket: any) => socket.destroy());
                // container.server.close((err: any) => {
                //     if (err) {
                //         Logger.warning(`Error closing http/s server running on ${port}`);
                //         throw err;
                //     }
                //     Logger.debug(`Container running on ${port} is closed`);
                // });
                // delete this.container[port];
                logger_1.Logger.debug(`Remaining http/s containers: ${Object.keys(this.container)}`);
            }
            else {
                logger_1.Logger.debug(`No need to close http/s server. Still ${container.counter} using it`);
            }
        }
        else {
            logger_1.Logger.warning(`No container running on ${port} to be closed`);
        }
    }
    createServer(app, secure, credentials) {
        if (secure) {
            return https_1.default.createServer(credentials, app);
        }
        return http_1.default.createServer(app);
    }
    listenToPort(server, port) {
        return new Promise((resolve, reject) => {
            // server.on('error', (err: any) => {
            //     const message = `Error emitted from server (${port}) ${err}`;
            //     Logger.error(message);
            //     return reject(message);
            // });
            let listenAttempt = 0;
            try {
                logger_1.Logger.trace(`Binding server to port ${port}`);
                server.listen(port, (err) => {
                    if (err) {
                        if (err.code === 'EADDRINUSE' && listenAttempt < 2) {
                            ++listenAttempt;
                            logger_1.Logger.warning(`Port ${port} in use, retrying... ${listenAttempt}`);
                            setTimeout(() => {
                                server.close();
                                resolve(this.listenToPort(server, port));
                            }, 1000);
                        }
                        else {
                            const message = `Error listening to port (${port}) ${err}`;
                            logger_1.Logger.error(message);
                            return reject(message);
                        }
                    }
                    logger_1.Logger.debug(`Server bound to port ${port}`);
                    return resolve();
                });
            }
            catch (err) {
                const message = `Error caught from server (${port}) ${err}`;
                logger_1.Logger.error(message);
                return reject(message);
            }
        });
    }
    createApp() {
        const app = express_1.default();
        app.use((req, res, next) => {
            req.setEncoding('utf8');
            req.rawBody = '';
            req.on('data', (chunk) => {
                req.rawBody += chunk;
            });
            req.on('end', () => {
                next();
            });
        });
        return app;
    }
}
exports.HttpServerPool = HttpServerPool;
