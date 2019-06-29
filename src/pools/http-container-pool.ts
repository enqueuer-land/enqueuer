import {Logger} from '../loggers/logger';
import {HttpContainer} from './http-container';
import * as core from 'express-serve-static-core';

export class HttpContainerPool {
    private static instance: HttpContainerPool;
    private containers: { [propName: number]: HttpContainer } = {};

    public static async getApp(port: number, secure: boolean = false, credentials?: any): Promise<core.Express> {
        const self = HttpContainerPool.getInstance();
        Logger.trace(`Getting a Http server ${port}`);
        let httpContainer: HttpContainer = self.containers[port];
        if (!httpContainer) {
            Logger.trace(`Creating a new Http server ${port}`);
            httpContainer = new HttpContainer(port, credentials);
            self.containers[port] = httpContainer;
            return await httpContainer.acquire();
        } else {
            Logger.trace(`Reusing Http server ${port}`);
            return await httpContainer.acquire();
        }
    }

    public static async releaseApp(port: number): Promise<void> {
        const self = HttpContainerPool.getInstance();

        Logger.trace(`Current containers: {${Object.keys(self.containers)}}`);
        const httpContainer = self.containers[port];
        if (httpContainer) {
            const number = await httpContainer.release();
            if (number === 0) {
                delete self.containers[port];
            }
        } else {
            Logger.trace(`No bound http-container to be released (${port})`);
        }
    }

    private static getInstance(): HttpContainerPool {
        if (!HttpContainerPool.instance) {
            HttpContainerPool.instance = new HttpContainerPool();
        }
        return HttpContainerPool.instance;
    }
}
