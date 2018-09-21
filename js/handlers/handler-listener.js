"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
class HandlerListener {
    constructor(server, remainingAttempts = 3, retryTimeout = 300) {
        this.server = server;
        this.remainingAttempts = remainingAttempts;
        this.retryTimeout = retryTimeout;
    }
    listen(handler) {
        return new Promise((resolve, reject) => {
            logger_1.Logger.trace(`Binding server to ${handler}`);
            this.server.on('error', (err) => {
                logger_1.Logger.warning(`Server emitted error: ${err}`);
                this.handleError(err, handler, resolve, reject);
            });
            try {
                this.tryToListen(handler, resolve, reject);
            }
            catch (err) {
                logger_1.Logger.warning(`Listen error caught: ${err}`);
                this.handleError(err, handler, resolve, reject);
            }
        });
    }
    tryToListen(handler, resolve, reject) {
        if (this.remainingAttempts > 0) {
            this.server.listen(handler, (err) => {
                if (err) {
                    this.handleError(err, handler, resolve, reject);
                }
                else {
                    const address = this.server.address();
                    if (!handler && address) {
                        const port = address.port;
                        logger_1.Logger.info(`No specified handler. Server is bound to (${port})`);
                    }
                    else {
                        logger_1.Logger.debug(`Server is bound to (${handler})`);
                    }
                    resolve();
                }
            });
        }
        else {
            reject(`Could not bind to handler ${handler}`);
        }
    }
    handleError(err, handler, resolve, reject) {
        if (err.code === 'EADDRINUSE') {
            --this.remainingAttempts;
            logger_1.Logger.warning(`Handler ${handler} is in use, retrying more ${this.remainingAttempts} times...`);
            setTimeout(() => {
                logger_1.Logger.debug(`Closing server`);
                this.server.close();
                this.tryToListen(handler, resolve, reject);
            }, this.retryTimeout);
        }
        else {
            const message = `Error listening to handler (${handler}) ${new javascript_object_notation_1.JavascriptObjectNotation().stringify(err)}`;
            logger_1.Logger.error(message);
            reject(message);
        }
    }
}
exports.HandlerListener = HandlerListener;
