const zmq = require('zeromq');

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;

        this.socket = zmq.socket('pub');
        if (this.subscriptionTimeout === undefined) {
            this.subscriptionTimeout = 0;
        }
        this.socket.on('accept', () => {
            if (this.waitingForListeners) {
                this.send();
            } else {
                this.accepted = true;
            }
        });
        this.socket
            .monitor(150, 0)
            .bindSync(this.publisher.address);

    }

    publish(context) {
        return new Promise((resolve) => {
            this.waitingForListeners = true;
            this.publishResolver = resolve;
            if (this.accepted) {
                this.send();
            } else {
                setTimeout(() => {
                    context.logger.debug(`ZeroMq detected no subscriptions. Publishing anyway`);
                    this.send();
                }, this.publisher.subscriptionTimeout);
            }
        });
    };

    send() {
        this.send = function () {};
        this.socket = this.socket.send([this.publisher.topic, this.publisher.payload]);
        this.socket.unbindSync(this.publisher.address);
        this.socket.close();
        this.publishResolver();
    }

}

module.exports = {Publisher};
