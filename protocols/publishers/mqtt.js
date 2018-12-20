const mqtt = require("mqtt");

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;

        this.publisher.options = this.publisher.options || {};
    }

    connectClient() {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(this.publisher.brokerAddress, this.publisher.options);
            if (client.connected) {
                resolve(client);
            } else {
                client.on('connect', () => resolve(client));
            }
            client.on('error', (err) => {
                reject(err);
            });
        });
    }

    publish(context) {
        return new Promise((resolve, reject) => {
            this.connectClient()
                .then(client => {
                    context.logger.debug(`Mqtt publishing in ${this.publisher.brokerAddress} - ${this.publisher.topic}: ${this.publisher.payload}`
                        .substr(0, 100).concat('...'));
                    const toPublish = typeof this.publisher.payload === 'object' ? JSON.stringify(this.publisher.payload) : this.publisher.payload;
                    client.publish(this.publisher.topic, toPublish, (err) => {
                        if (err) {
                            context.logger.error(`Error publishing in ${this.publisher.brokerAddress} - ${this.publisher.topic}: ${err}`);
                            reject(err);
                        }
                    });
                    client.end();
                    resolve();
                });
        });

    }
}

module.exports = {Publisher};
