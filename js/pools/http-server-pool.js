"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const logger_1 = require("../loggers/logger");
const handler_listener_1 = require("../handlers/handler-listener");
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
                this.closeContainer(port);
            }
            else {
                logger_1.Logger.debug(`No need to close http/s server. Still ${container.counter} using it`);
            }
        }
        else {
            logger_1.Logger.warning(`No container running on ${port} to be closed`);
        }
    }
    closeContainer(port) {
        const container = this.container[port];
        logger_1.Logger.debug(`Closing container running on ${port}. Connections: ${container.sockets.length}`);
        container.sockets.forEach((socket) => socket.destroy());
        container.server.close((err) => {
            if (err) {
                logger_1.Logger.warning(`Error closing http/s server running on ${port}`);
                throw err;
            }
            logger_1.Logger.debug(`Container running on ${port} is closed`);
        });
        delete this.container[port];
        logger_1.Logger.debug(`Remaining http/s containers: ${Object.keys(this.container)}`);
    }
    createServer(app, secure, credentials) {
        if (secure) {
            return https_1.default.createServer(credentials, app);
        }
        return http_1.default.createServer(app);
    }
    listenToPort(server, port) {
        return new Promise((resolve, reject) => {
            new handler_listener_1.HandlerListener(server)
                .listen(port)
                .then(() => {
                logger_1.Logger.debug(`Http/s server is listening for clients on ${port}`);
                resolve();
            })
                .catch(err => {
                const message = `Http/s server could not listen to ${port}: ${err}`;
                logger_1.Logger.error(message);
                reject(message);
            });
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
