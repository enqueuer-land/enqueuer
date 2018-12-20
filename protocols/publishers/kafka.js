const kafka = require('kafka-node');

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;

        this.client = new kafka.KafkaClient(publisher.client);
        this.kafkaPayload = [
            {topic: publisher.topic, messages: this.publisher.payload}
        ];

    }

    publish(context) {
        return new Promise((resolve, reject) => {
            const producer = new kafka.Producer(this.client);
            context.logger.trace(`Waiting for kafka publisher client connection`);
            producer.on('error', async (err) => {
                context.logger.error(`Error on publishing kafka message ${JSON.stringify(err)}`);
                producer.close();
                this.client.close();
                reject(err);
            });

            context.logger.trace(`Kafka publisher is ready`);
            producer.send(this.kafkaPayload, async (err, data) => {
                if (err) {
                    context.logger.error(`Error sending kafka message ${JSON.stringify(err)}`);
                    reject(err);
                } else {
                    context.logger.debug(`Kafka publisher message received`);
                    producer.close();
                    this.client.close();
                    resolve(JSON.stringify(data));
                }
            });

        });

    };
}

module.exports = {Publisher};
