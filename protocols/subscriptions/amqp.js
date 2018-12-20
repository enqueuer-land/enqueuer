const amqp = require("amqp");

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;

        this.subscription.queueName = this.subscription.queueName || this.createQueueName();
    }

    createQueueName()
    {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';

        for (let i = 10; i > 0; --i) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    receiveMessage(context) {
        return new Promise((resolve) => {
            context.logger.debug(`Amqp subscription registering receiveMessage resolver`);
            this.messageReceiverPromiseResolver = resolve;
        });
    };

    subscribe() {
        this.connection = amqp.createConnection(this.subscription.options);
        return new Promise((resolve, reject) => {
            this.connection.once('ready', () => {
                this.connectionReady(resolve, reject);
            });
            this.connection.on('error', (err) => reject(err));
        });
    };

    async unsubscribe() {
        if (this.connection) {
            this.connection.disconnect();
        }
        delete this.connection;
    }

    connectionReady(resolve, reject) {
        this.connection.queue(this.subscription.queueName, (queue) => {
            queue.subscribe((message, headers, deliveryInfo) => this.gotMessage(message, headers, deliveryInfo));
            if (this.subscription.exchange && this.subscription.routingKey) {
                this.bind(queue, resolve);
            } else if (this.subscription.queueName) {
                resolve();
            } else {
                reject(`Impossible to subscribe: ${this.queueName}:${this.subscription.exchange}:${this.subscription.routingKey}`);
            }
        });
    }

    bind(queue, resolve) {
        queue.bind(this.subscription.exchange, this.subscription.routingKey, () => resolve());
    }

    gotMessage(message, headers, deliveryInfo) {
        if (this.messageReceiverPromiseResolver) {
            this.messageReceiverPromiseResolver({payload: message, headers: headers, deliveryInfo: deliveryInfo});
        }
    }

}

module.exports = {Subscription};
