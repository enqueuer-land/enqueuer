const kafka = require('kafka-node');

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;

        this.subscription.options.requestTimeout = subscription.options.requestTimeout || 10000;
        this.subscription.options.connectTimeout = subscription.options.connectTimeout || 10000;
        this.client = new kafka.KafkaClient(this.subscription.client);
        this.offset = new kafka.Offset(this.client);
    }

    async subscribe(context) {
        try {
            this.client.on('error', (err) => {
                const message = `Error subscribing to kafka ${JSON.stringify(err)}`;
                context.logger.error(message);
                throw message;
            });
            return await this.fetchOffset();
        } catch (exc) {
            const message = `Error connecting kafka ${JSON.stringify(exc)}`;
            context.logger.error(message);
            throw message;
        }
    };

    fetchOffset() {
        return new Promise((resolve, reject) => {
            try {
                this.offset.fetchLatestOffsets([this.subscription.options.topic], async (error, offsets) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.latestOffset = offsets[this.subscription.options.topic][0];
                        this.ableToUnsubscribe = true;
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    async unsubscribe() {
        if (this.ableToUnsubscribe) {
            this.client.close();
        }
    }

    createConsumer() {
        return new kafka.Consumer(
            this.client,
            [{
                topic: this.subscription.options.topic,
                offset: this.latestOffset
            }],
            {
                fromOffset: true
            }
        );
    }


    receiveMessage(context) {
        return new Promise((resolve, reject) => {
            const consumer = this.createConsumer();
            consumer.on('message', (message) => {
                context.logger.trace('Kafka message data: ' + JSON.stringify(message));
                resolve(message);
                consumer.close(() => {
                    context.logger.trace('Kafka consumer is closed');
                });
            });

            consumer.on('error', (error) => {
                context.logger.error('Kafka error message data: ' + JSON.stringify(error));
                reject(error);
                consumer.close(() => {
                    context.logger.trace('Kafka consumer is closed');
                });
            });

        });

    };
}

module.exports = {Subscription};
