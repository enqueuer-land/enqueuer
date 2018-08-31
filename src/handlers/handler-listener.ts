import {Logger} from '../loggers/logger';

export class HandlerListener {
    private server: any;
    private remainingAttempts: number;
    private retryTimeout: number;

    public constructor(server: any, retryTimeout: number = 300, remainingAttempts: number = 3) {
        this.server = server;
        this.retryTimeout = retryTimeout;
        this.remainingAttempts = remainingAttempts;
    }

    public listen(handler: any): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.trace(`Binding server to ${handler}`);
            this.server.on('error', (err: any) => {
                Logger.warning(`Server emitted error: ${err}`);
                this.handleError(err, handler, resolve, reject);
            });
            try {
                this.tryToListen(handler, resolve, reject);
            } catch (err) {
                Logger.warning(`Listen error caught: ${err}`);
                this.handleError(err, handler, resolve, reject);
            }
        });
    }

    private tryToListen(handler: any, resolve: any, reject: any) {
        if (this.remainingAttempts > 0) {
            this.server.listen(handler, (err: any) => {
                if (err) {
                    this.handleError(err, handler, resolve, reject);
                } else {
                    Logger.info(`Server bound to (${handler})`);
                    resolve();
                }
            });
        } else {
            reject(`No more remaining attempts to bound to handler ${handler}`);
        }
    }

    private handleError(err: any, handler: any, resolve: any, reject: any) {
        if (err.code === 'EADDRINUSE') {
            --this.remainingAttempts;
            Logger.warning(`Handler ${handler} is in use, retrying more ${this.remainingAttempts} times...`);
            setTimeout(() => {
                Logger.debug(`Closing server`);
                this.server.close();
                this.tryToListen(handler, resolve, reject);
            }, this.retryTimeout);
        } else {
            const message = `Error listening to handler (${handler}) ${err}`;
            Logger.error(message);
            reject(message);
        }
    }
}