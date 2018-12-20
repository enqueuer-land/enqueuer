const container = require('rhea');

class Subscription {

    rejectCallback(event, err, reject) { reject(`AMQP-1 container emitter '${event}' event: ${err.error}`) };

    constructor(subscription) {
        this.subscription = subscription;
    }

    subscribe(context) {
        return new Promise((resolve, reject) => {
            this.registerFailures(reject);
            if (this.subscription.server === true) {
                const server = container.listen(this.subscription.connection);
                server.once('listening', resolve);
                server.once('connection', server.close);
                server.once('error', (err) => reject(err.error));
            } else {
                container.connect(this.subscription.connection);
                this.removeFailure();
            }
            container.once('connection_open', (connection) => {
                context.logger.info(`Amqp-1.0 connection opened`);
                this.removeFailure();
                connection.connection.open_receiver(this.subscription.options);
                resolve();
            });
        });
    };

    receiveMessage(context) {
        return new Promise((resolve, reject) => {
            container.once('message', (message) => {
                resolve(message.message);
                message.connection.close();
            });
            container.once('error', reject);
        });
    };

    registerFailures(reject) {
        container.once('connection_close', (err) => this.rejectCallback('connection_close', err, reject));
        container.once('connection_error', (err) => this.rejectCallback('connection_error', err, reject));
        container.once('error', (err) => this.rejectCallback('error', err, reject));
        container.once('receiver_close', (err) => this.rejectCallback('receiver_close', err, reject));
    }

    removeFailure() {
        container.removeAllListeners('connection_close');
        container.removeAllListeners('connection_error');
        container.removeAllListeners('error');
        container.removeAllListeners('receiver_close');
    }
}
module.exports = {Subscription};
