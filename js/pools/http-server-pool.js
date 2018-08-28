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
    releaseApp(port) {
        const container = this.container[port];
        if (container) {
            --container.counter;
            if (container.counter <= 0) {
                container.server.close();
                logger_1.Logger.debug(`Container running on ${port} is closed`);
                delete this.container[port];
            }
            else {
                logger_1.Logger.debug(`No need to close http/s server. Still ${container.counter} using it`);
            }
        }
        else {
            logger_1.Logger.warning(`No container running on ${port} to be closed`);
        }
        logger_1.Logger.debug(`Remaining http/s containers: ${Object.keys(this.container)}`);
    }
    getApp(port, secure, credentials) {
        return new Promise((resolve, reject) => {
            logger_1.Logger.info(`Getting a Http/s server ${port}`);
            if (!this.container[port]) {
                logger_1.Logger.info(`Creating a new Http/s server ${port}`);
                const app = this.createApp();
                const server = this.createServer(app, secure, credentials);
                this.listenToPort(server, port)
                    .then(() => {
                    this.container[port] = {
                        app,
                        server,
                        counter: 0
                    };
                    resolve(app);
                })
                    .catch((err) => reject(err));
            }
            else {
                ++this.container[port].counter;
                resolve(this.container[port].app);
            }
        });
    }
    createServer(app, secure, credentials) {
        if (secure) {
            return https_1.default.createServer(credentials, app);
        }
        return http_1.default.createServer(app);
    }
    listenToPort(server, port) {
        return new Promise((resolve, reject) => {
            server.on('error', (err) => {
                if (err) {
                    const message = `Error emitted from server (${port}) ${err}`;
                    logger_1.Logger.error(message);
                    return reject(message);
                }
            });
            try {
                logger_1.Logger.info(`Binding server to port ${port}`);
                server.listen(port, (err) => {
                    if (err) {
                        const message = `Error listening to port (${port}) ${err}`;
                        logger_1.Logger.error(message);
                        return reject(message);
                    }
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
