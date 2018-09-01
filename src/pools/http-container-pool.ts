import {Logger} from '../loggers/logger';
import {HttpContainer} from './http-container';

export class HttpContainerPool {
    private static instance: HttpContainerPool;
    private containers: { [propName: number]: HttpContainer } = {};

    public static getInstance(): HttpContainerPool {
        if (!HttpContainerPool.instance) {
            HttpContainerPool.instance = new HttpContainerPool();
        }
        return HttpContainerPool.instance;
    }

    public getApp(port: number, secure: boolean, credentials?: any): Promise<any> {
        Logger.debug(`Getting a Http/s server ${port}`);
        let httpContainer: HttpContainer = this.containers[port];
        if (!httpContainer) {
            Logger.info(`Creating a new Http/s server ${port}`);
            httpContainer = new HttpContainer(port, secure, credentials);
            this.containers[port] = httpContainer;
        } else {
            Logger.trace(`Reusing Http/s server ${port}`);
        }
        return httpContainer.acquire();
    }

    public releaseApp(port: number) {
        Logger.trace(`Current containers: {${Object.keys(this.containers)}}`);
        Logger.info(`Releasing (${port}) http/s container`);
        const httpContainer = this.containers[port];
        if (httpContainer) {
            httpContainer.release(() => delete this.containers[port]);
        } else {
            Logger.warning(`Trying to release an unbound server (${port})`);
        }
    }
}
