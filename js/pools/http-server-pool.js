"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
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
    getHttpsServer(key, cert) {
        ++this.https.counter;
        if (!this.http.server) {
            this.initializeExpress();
            logger_1.Logger.debug('Creating a new Https server');
            const options = {
                key: key,
                cert: cert
            };
            this.https.server = https_1.default.createServer(options, this.app);
        }
        return this.https.server;
    }
    closeHttpServer() {
        --this.http.counter;
        if (this.http.counter == 0) {
            logger_1.Logger.debug('Closing http server');
            this.http.server.close();
            this.http.server = null;
            this.finalizeExpress();
        }
    }
    closeHttpsServer() {
        --this.http.counter;
        if (this.http.counter == 0) {
            logger_1.Logger.debug('Closing http server');
            this.http.server.close();
            this.http.server = null;
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
            this.app = null;
        }
    }
}
exports.HttpServerPool = HttpServerPool;
