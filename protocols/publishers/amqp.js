const amqp = require('amqp');

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;

        this.publisher.messageOptions = this.publisher.messageOptions || {};
        this.publisher.exchangeOptions = this.publisher.exchangeOptions || {};
        this.publisher.exchangeOptions.confirm = true;
        if (this.publisher.exchangeOptions.passive === undefined) {
            this.publisher.exchangeOptions.passive = true;
        }
    }

    publish(context) {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.publisher.options);
            this.connection.once('ready', () => {
                const exchange = this.getExchange();
                context.logger.debug(`Exchange to publish: '${this.publisher.exchange || 'default'}' created`);
                exchange.once('open', () => {
                    this.exchangeOpen(exchange, reject, resolve);
                });
            });
            this.connection.on('error', (err) => {
                return reject(err);
            });
        });
    }

    getExchange() {
        return this.connection.exchange(this.publisher.exchange || '', this.publisher.exchangeOptions);
    }

    exchangeOpen(exchange, reject, resolve) {
        exchange.publish(this.publisher.routingKey, this.publisher.payload, this.publisher.messageOptions, (errored, err) => {
            this.connection.disconnect();
            this.connection.end();
            if (errored) {
                return reject(err);
            }
            resolve();
        });
    }

}

module.exports = {Publisher};
