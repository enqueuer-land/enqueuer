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
            counter: 0,
            server: null
        };
        this.https = {
            counter: 0,
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
    getHttpServer() {
        ++this.http.counter;
        if (!this.http.server) {
            this.initializeExpress();
            logger_1.Logger.debug('Creating a new Http server');
            this.http.server = http_1.default.createServer(this.app);
        }
        return this.http.server;
    }
    getHttpsServer(credentials) {
        ++this.https.counter;
        if (!this.http.server) {
            this.initializeExpress();
            logger_1.Logger.debug(`Creating a new Https server: ${credentials}`);
            this.https.server = https_1.default.createServer(credentials, this.app);
        }
        return this.https.server;
    }
    closeHttpServer() {
        logger_1.Logger.debug('Closing http server');
        this.closeServer(this.http);
    }
    closeHttpsServer() {
        logger_1.Logger.debug('Closing https server');
        this.closeServer(this.https);
    }
    closeServer(server) {
        --server.counter;
        if (server.counter == 0) {
            logger_1.Logger.debug('Closing https server');
            server.server.close();
            server.server = null;
            this.finalizeExpress();
        }
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
    finalizeExpress() {
        if (this.http.counter + this.https.counter <= 0) {
            logger_1.Logger.trace(`Finalizing express application`);
            this.app = null;
        }
    }
}
exports.HttpServerPool = HttpServerPool;
