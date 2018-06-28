import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {KafkaClient, Producer} from 'kafka-node';

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === 'kafka'})
export class KafkaPublisher extends Publisher {
    private producer: Producer;
    private topic: string;
    private kafkaPayload: [{ topic: string; messages: string }];

    constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);

        this.topic = publisherProperties.topic;
        const client = new KafkaClient(publisherProperties.client);
        this.producer = new Producer(client);
        this.kafkaPayload = [
            { topic: this.topic, messages: this.payload }
        ];
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.producer.on('ready', () => {
                Logger.trace(`Kafka publisher is ready`);
                this.producer.send(this.kafkaPayload, (err: any, data: {}) => {
                    if (err) {
                        Logger.error(`Error sending kafka message ${JSON.stringify(err, null, 2)}`);
                        return reject(err);
                    }
                    Logger.trace(`Kafka publish message data ${JSON.stringify(data, null, 2)}`);
                    this.messageReceived = JSON.stringify(data);
                    return resolve();
                });
            });

            this.producer.on('error', (err) => {
                Logger.error(`Error on publishing kafka message ${JSON.stringify(err, null, 2)}`);
                return reject(err);
            });
        });
    }

}
