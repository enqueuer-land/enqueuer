const dgram = require("dgram");

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;
    }

    subscribe(context) {

        return new Promise((resolve, reject) => {
            this.server = dgram.createSocket('udp4');
            try {
                this.server.bind(this.subscription.port);
                resolve();
            } catch (err) {
                const message = `Udp server could not listen to ${this.subscription.port}`;
                context.logger.error(message);
                reject(message);
            }
        });
    };

    receiveMessage(context) {
        return new Promise((resolve, reject) => {
            this.server.on('error', (err) => {
                this.server.close();
                reject(err);
            });

            this.server.on('message', (msg, remoteInfo) => {
                this.server.close();
                resolve({payload: msg, remoteInfo: remoteInfo});
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
            const client = dgram.createSocket('udp4');
            context.logger.debug('Udp client trying to send message');

            client.send(Buffer.from(this.publisher.payload), this.publisher.port, this.publisher.serverAddress, (error) => {
                if (error) {
                    client.close();
                    reject(error);
                    return;
                }
                context.logger.debug('Udp client sent message');
                resolve();
            });

        });
    };
}

module.exports = {Subscription, Publisher};
