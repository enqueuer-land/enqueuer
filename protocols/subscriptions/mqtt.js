const mqtt = require("mqtt");

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;

        this.subscription.options = subscription.options || {};
        this.subscription.options.connectTimeout = this.subscription.options.connectTimeout || 10 * 1000;
    }

    subscribe(context) {
        return new Promise((resolve, reject) => {
            context.logger.trace(`Mqtt connecting to broker ${this.subscription.brokerAddress}`);
            this.client = mqtt.connect(this.subscription.brokerAddress, this.subscription.options);
            context.logger.trace(`Mqtt client created`);
            if (!this.client.connected) {
                this.client.on('connect', () => {
                    this.subscribeToTopic(reject, resolve);
                });
            } else {
                this.subscribeToTopic(reject, resolve);
            }
            this.client.on('error', (error) => {
                context.logger.error(`Error subscribing to mqtt ${error}`);
                reject(error);
            });
        });

    };

    async unsubscribe() {
        if (this.client) {
            this.client.unsubscribe(this.subscription.topic);
            this.client.end(true);
        }
        delete this.client;
    }


    receiveMessage(context) {
        return new Promise((resolve, reject) => {
            if (!this.client.connected) {
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.subscription.topic}`);
            } else {
                context.logger.debug('Mqtt message receiver resolver initialized');
                this.messageReceivedResolver = resolve;
            }
        });

    };

    subscribeToTopic(reject, resolve) {
        this.client.subscribe(this.subscription.topic, (err) => {
            if (err) {
                reject(err);
            } else {
                this.client.on('message', (topic, payload) => this.gotMessage(topic, payload));
                resolve();
            }
        });
    }

    gotMessage(topic, payload) {
        if (this.messageReceivedResolver) {
            this.messageReceivedResolver({topic: topic, payload: payload});
        }
    }

}

module.exports = {Subscription};
