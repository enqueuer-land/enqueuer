import {Logger} from '../loggers/logger';
import {HttpContainer} from './http-container';

export class HttpContainerPool {
    private static instance: HttpContainerPool;
    private containers: { [propName: number]: HttpContainer } = {};

    public static getApp(port: number, secure: boolean = false, credentials?: any): Promise<any> {
        const self = HttpContainerPool.getInstance();
        Logger.debug(`Getting a Http/s server ${port}`);
        let httpContainer: HttpContainer = self.containers[port];
        if (!httpContainer) {
            Logger.info(`Creating a new Http/s server ${port}`);
            httpContainer = new HttpContainer(port, secure, credentials);
            self.containers[port] = httpContainer;
        } else {
            Logger.trace(`Reusing Http/s server ${port}`);
        }
        return httpContainer.acquire();
    }

    public static releaseApp(port: number): Promise<void> {
        return new Promise((resolve) => {
            const self = HttpContainerPool.getInstance();
            Logger.trace(`Current containers: {${Object.keys(self.containers)}}`);
            Logger.info(`Releasing (${port}) http/s container`);
            const httpContainer = self.containers[port];
            if (httpContainer) {
                httpContainer.release(() => {
                    delete self.containers[port];
                    resolve();
                });
            } else {
                Logger.warning(`No bound http-container to be released (${port})`);
                resolve();
            }
        });
    }

    private static getInstance(): HttpContainerPool {
        if (!HttpContainerPool.instance) {
            HttpContainerPool.instance = new HttpContainerPool();
        }
        return HttpContainerPool.instance;
    }
}
