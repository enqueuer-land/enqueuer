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
        this.http = {
            ports: [],
            server: null
        };
        this.https = {
            ports: [],
            server: null
        };
    }
    static getInstance() {
        if (!HttpServerPool.instance) {
            HttpServerPool.instance = new HttpServerPool();
        }
        return HttpServerPool.instance;
    }
    getApp() {
        return this.app;
    }
    getHttpServer(port) {
        return new Promise((resolve, reject) => {
            logger_1.Logger.debug(`Getting a Http server ${port}`);
            if (!this.http.server) {
                this.initializeExpress();
                logger_1.Logger.debug(`Creating a new Http server ${port}`);
                const server = http_1.default.createServer(this.app);
                this.http.server = server;
            }
            this.http.server.on('error', (err) => {
                if (err) {
                    const message = `Error creating http ${err}`;
                    logger_1.Logger.error(message);
                    return reject(message);
                }
            });
            if (this.http.ports.filter((value) => value == port).length == 0) {
                this.http.server.listen(port, (err) => {
                    if (err) {
                        const message = `Error listening http ${err}`;
                        logger_1.Logger.error(message);
                        return reject(message);
                    }
                    this.http.ports.push(port);
                    return resolve();
                });
            }
            else {
                this.http.ports.push(port);
                return resolve();
            }
        });
    }
    getHttpsServer(credentials, port) {
        logger_1.Logger.debug(`Getting a Https server ${port}`);
        return new Promise((resolve, reject) => {
            if (!this.https.server) {
                this.initializeExpress();
                logger_1.Logger.debug(`Creating a new Https server ${port}`);
                const server = https_1.default.createServer(credentials, this.app);
                this.https.server = server;
            }
            this.https.server.on('error', (err) => {
                if (err) {
                    const message = `Error creating https ${err}`;
                    logger_1.Logger.error(message);
                    return reject(message);
                }
            });
            if (this.https.ports.filter((value) => value == port).length == 0) {
                this.https.server.listen(port, (err) => {
                    if (err) {
                        const message = `Error listening https ${err}`;
                        logger_1.Logger.error(message);
                        return reject(message);
                    }
                    this.https.ports.push(port);
                    return resolve();
                });
            }
            else {
                this.https.ports.push(port);
                return resolve();
            }
        });
    }
    initializeExpress() {
        if (!this.app) {
            this.app = express_1.default();
            this.app.use((req, res, next) => {
                req.setEncoding('utf8');
                req.rawBody = '';
                req.on('data', function (chunk) {
                    req.rawBody += chunk;
                });
                req.on('end', function () {
                    logger_1.Logger.trace(`Http(s) server got message: ${req.rawBody}`);
                    next();
                });
            });
        }
    }
}
exports.HttpServerPool = HttpServerPool;
