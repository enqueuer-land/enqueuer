"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const http_container_1 = require("./http-container");
class HttpContainerPool {
    constructor() {
        this.containers = {};
    }
    static getInstance() {
        if (!HttpContainerPool.instance) {
            HttpContainerPool.instance = new HttpContainerPool();
        }
        return HttpContainerPool.instance;
    }
    getApp(port, secure, credentials) {
        logger_1.Logger.debug(`Getting a Http/s server ${port}`);
        let httpContainer = this.containers[port];
        if (!httpContainer) {
            logger_1.Logger.info(`Creating a new Http/s server ${port}`);
            httpContainer = new http_container_1.HttpContainer(port, secure, credentials);
            this.containers[port] = httpContainer;
        }
        else {
            logger_1.Logger.trace(`Reusing Http/s server ${port}`);
        }
        return httpContainer.acquire();
    }
    releaseApp(port) {
        logger_1.Logger.trace(`Current containers: {${Object.keys(this.containers)}}`);
        logger_1.Logger.info(`Releasing (${port}) http/s container`);
        const httpContainer = this.containers[port];
        if (httpContainer) {
            httpContainer.release(() => delete this.containers[port]);
        }
        else {
            logger_1.Logger.warning(`Trying to release an unbound server (${port})`);
        }
    }
}
exports.HttpContainerPool = HttpContainerPool;
