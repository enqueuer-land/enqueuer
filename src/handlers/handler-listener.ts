import {Logger} from '../loggers/logger';

export class HandlerListener {
    private server: any;
    private remainingAttempts: number;
    private retryTimeout: number;

    public constructor(server: any, remainingAttempts: number = 3, retryTimeout: number = 300) {
        this.server = server;
        this.remainingAttempts = remainingAttempts;
        this.retryTimeout = retryTimeout;
    }

    public listen(handler: number | string): Promise<void> {
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

    private tryToListen(handler: number | string, resolve: any, reject: any) {
        if (this.remainingAttempts > 0) {
            this.server.listen(handler, (err: any) => {
                if (err) {
                    this.handleError(err, handler, resolve, reject);
                } else {
                    Logger.debug(`Server bound to (${handler})`);
                    resolve();
                }
            });
        } else {
            reject(`Could not bind to handler ${handler}`);
        }
    }

    private handleError(err: any, handler: number | string, resolve: any, reject: any) {
        if (err.code === 'EADDRINUSE') {
            --this.remainingAttempts;
            Logger.warning(`Handler ${handler} is in use, retrying more ${this.remainingAttempts} times...`);
            setTimeout(() => {
                Logger.debug(`Closing server`);
                this.server.close();
                this.tryToListen(handler, resolve, reject);
            }, this.retryTimeout);
        } else {
            const message = `Error listening to handler (${handler}) ${JSON.stringify(err)}`;
            Logger.error(message);
            reject(message);
        }
    }
}