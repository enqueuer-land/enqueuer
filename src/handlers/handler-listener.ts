import {Logger} from '../loggers/logger';
import {JsonObjectParser} from '../object-parser/json-object-parser';

export class HandlerListener {
    public static ADDRESS_IN_USE = 'EADDRINUSE';

    private server: any;
    private remainingAttempts: number;
    private retryTimeout: number;
    private handler: number | string = '';

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
                    const address = this.server.address();
                    if (!handler && address) {
                        this.handler = address.port;
                        Logger.info(`No specified handler. Server is bound to (${this.handler})`);
                    } else {
                        this.handler = handler;
                        Logger.debug(`Server is bound to (${this.handler})`);
                    }
                    resolve();
                }
            });
        } else {
            reject(`Could not bind to handler ${handler}`);
        }
    }

    private handleError(err: any, handler: number | string, resolve: any, reject: any) {
        if (err.code === HandlerListener.ADDRESS_IN_USE) {
            --this.remainingAttempts;
            Logger.warning(`Handler ${handler} is busy.` +
                ` Waiting for ${this.retryTimeout}ms before trying again for ${this.remainingAttempts} more times...`);
            setTimeout(() => {
                Logger.debug(`Closing server`);
                this.server.close();
                this.retryTimeout *= 2;
                this.tryToListen(handler, resolve, reject);
            }, this.retryTimeout);
        } else {
            const message = `Error listening to handler (${handler}) ${new JsonObjectParser().stringify(err)}`;
            Logger.error(message);
            reject(message);
        }
    }

    public getHandler(): string | number {
        return this.handler;
    }
}
