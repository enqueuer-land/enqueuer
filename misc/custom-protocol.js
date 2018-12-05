const Stomp = require('stomp-client');

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;
    }

    subscribe(context) {
        return new Promise((resolve, reject) => {
            context.logger.debug(`Stomp subscription connecting to ${this.subscription.address}:${this.subscription.port}`);
            this.subscription.client = new Stomp(this.subscription.address, this.subscription.port, this.subscription.user, this.subscription.password);
            this.subscription.client.connect((sessionId) => {
                context.logger.debug(`connected id ${sessionId}`);
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    };

    receiveMessage(context) {
        return new Promise((resolve, reject) => {
            context.logger.trace(`Stomp waiting for a message related to queue ${this.subscription.queue}`);
            const gotMessage = (message, headers) => {
                context.logger.trace(`Stomp message received header ${JSON.stringify(headers)}`);
                resolve({payload: message, headers: headers});
            };
            this.subscription.client.subscribe(this.subscription.queue, gotMessage);
            this.subscription.client.on('message', gotMessage);
            this.subscription.client.once('error', (err) => {
                reject(err);
            });
        });
    };
}

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;
    }

    publish(context) {
        return new Promise((resolve, reject) => {
            const client = new Stomp(this.publisher.address, this.publisher.port, this.publisher.user, this.publisher.password);
            client.connect((sessionId) => {
                context.logger.debug(`Stomp publisher connected id ${sessionId}`);
                client.publish(this.publisher.queue, this.publisher.payload);
                resolve();
            }, (err) => {
                context.logger.error(`Error connecting to stomp to publish: ${err}`);
                reject(err);
            });
        });
    };
}

module.exports = {Subscription, Publisher};
