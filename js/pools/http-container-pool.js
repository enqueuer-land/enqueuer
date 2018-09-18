"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const http_container_1 = require("./http-container");
class HttpContainerPool {
    constructor() {
        this.containers = {};
    }
    static getApp(port, secure = false, credentials) {
        const self = HttpContainerPool.getInstance();
        logger_1.Logger.debug(`Getting a Http/s server ${port}`);
        let httpContainer = self.containers[port];
        if (!httpContainer) {
            logger_1.Logger.info(`Creating a new Http/s server ${port}`);
            httpContainer = new http_container_1.HttpContainer(port, secure, credentials);
            self.containers[port] = httpContainer;
        }
        else {
            logger_1.Logger.trace(`Reusing Http/s server ${port}`);
        }
        return httpContainer.acquire();
    }
    static releaseApp(port) {
        return new Promise((resolve) => {
            const self = HttpContainerPool.getInstance();
            logger_1.Logger.trace(`Current containers: {${Object.keys(self.containers)}}`);
            logger_1.Logger.info(`Releasing (${port}) http/s container`);
            const httpContainer = self.containers[port];
            if (httpContainer) {
                httpContainer.release(() => {
                    delete self.containers[port];
                    resolve();
                });
            }
            else {
                logger_1.Logger.warning(`No bound http-container to be released (${port})`);
                resolve();
            }
        });
    }
    static getInstance() {
        if (!HttpContainerPool.instance) {
            HttpContainerPool.instance = new HttpContainerPool();
        }
        return HttpContainerPool.instance;
    }
}
exports.HttpContainerPool = HttpContainerPool;
