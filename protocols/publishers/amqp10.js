const container = require('rhea');

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;
    }

    publish() {
        return new Promise((resolve, reject) => {
            container.once('connection_error', (err) => reject(err.error));
            container.once('error', (err) => reject(err.error));
            container.once('sender_error', (err) => reject(err.error));
            container.once('disconnected', (err) => reject(err.error));
            container.once('rejected', (err) => reject(err.error));
            container.once('connection_open', (context) => {
                context.connection.open_sender(this.publisher.options);
            });
            container.once('sendable', (context) => {
                const delivery = context.sender.send(this.publisher.payload);
                context.sender.detach();
                resolve(delivery);
            });
            container.connect(this.publisher.connection);
        });
    }
}

module.exports = {Publisher};
