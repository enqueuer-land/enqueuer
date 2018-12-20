const zmq = require('zeromq');

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;
        this.socket = zmq.socket('sub');
    }

    subscribe(context) {
        return new Promise((resolve) => {

            context.logger.trace(`Trying to subscribe to zeroMq ${this.subscription.address}`);
            this.socket.on('connect', () => {
                context.logger.debug(`Zeromq sub emitted: 'connect'`);
                resolve();
            });
            this.socket
                .monitor(150, 0)
                .connect(this.subscription.address)
                .subscribe(this.subscription.topic);
        });
    };

    receiveMessage(context) {
        return new Promise((resolve) => {
            context.logger.trace(`ZeroMqSub waiting for a message in topic ${this.subscription.topic}`);
            this.socket.on('message', (topic, message) => {
                context.logger.debug(`ZeroMqSub received a message in topic ${topic.toString()}`);
                this.socket.unsubscribe(this.subscription.topic);
                this.socket.disconnect(this.subscription.address);
                this.socket.close();
                resolve({topic: topic, payload: message});
            });
        });
    };
}

module.exports = {Subscription};
