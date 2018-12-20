const Stomp = require('stomp-client');

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

module.exports = {Publisher};
