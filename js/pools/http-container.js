"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const handler_listener_1 = require("../handlers/handler-listener");
//TODO test it
class HttpContainer {
    constructor(port, secure, credentials) {
        this.counter = 0;
        this.sockets = new Set();
        this.port = port;
        this.app = this.createApp();
        this.server = this.createServer(secure, credentials);
        this.handleNewSocketConnections();
    }
    acquire() {
        return new Promise((resolve, reject) => {
            ++this.counter;
            if (this.counter == 1) {
                this.listenToPort()
                    .then(() => resolve(this.app))
                    .catch((err) => reject(err));
            }
            else {
                resolve(this.app);
            }
        });
    }
    release(onClose) {
        --this.counter;
        if (this.counter <= 0) {
            logger_1.Logger.debug(`Closing container ${this.port}`);
            this.sockets.forEach((socket) => socket.destroy());
            this.server.close((err) => {
                if (err) {
                    throw err;
                }
                logger_1.Logger.debug(`Container ${this.port} is closed`);
                onClose();
            });
        }
    }
    listenToPort() {
        return new Promise((resolve, reject) => {
            new handler_listener_1.HandlerListener(this.server)
                .listen(this.port)
                .then(() => {
                logger_1.Logger.debug(`Http/s server is listening for clients on ${this.port}`);
                resolve();
            })
                .catch(err => {
                const message = `Http/s server could not listen to ${this.port}: ${err}`;
                logger_1.Logger.error(message);
                reject(message);
            });
        });
    }
    handleNewSocketConnections() {
        this.server.on('connection', (socket) => {
            logger_1.Logger.trace(`Container ${this.port} got a new connection`);
            this.sockets.add(socket);
            socket.on('close', () => {
                this.sockets.delete(socket);
            });
        });
    }
    createServer(secure, credentials) {
        if (secure) {
            return https_1.default.createServer(credentials, this.app);
        }
        return http_1.default.createServer(this.app);
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
exports.HttpContainer = HttpContainer;
