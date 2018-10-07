import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {KafkaClient, Producer} from 'kafka-node';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('kafka').setLibrary('kafka-node')
    .registerAsPublisher();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class KafkaPublisher extends Publisher {
    private readonly kafkaPayload: [{ topic: string; messages: string }];
    private readonly client: KafkaClient;

    constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);

        this.client = new KafkaClient(publisherProperties.client);
        this.kafkaPayload = [
            { topic: publisherProperties.topic, messages: this.payload }
        ];
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            const producer = new Producer(this.client);
            Logger.trace(`Waiting for kafka publisher client connection`);
            producer.on('error', async (err: any) => {
                Logger.error(`Error on publishing kafka message ${new JavascriptObjectNotation().stringify(err)}`);
                producer.close();
                this.client.close();
                reject(err);
            });

            Logger.trace(`Kafka publisher is ready`);
            producer.send(this.kafkaPayload, async (err, data) => {
                if (err) {
                    Logger.error(`Error sending kafka message ${new JavascriptObjectNotation().stringify(err)}`);
                    reject(err);
                } else {
                    producer.close();
                    this.onSend(data, resolve);
                }
            });

        });
    }

    private onSend(data: any, resolve: any) {
        Logger.trace(`Kafka publish message data ${new JavascriptObjectNotation().stringify(data)}`);
        this.messageReceived = new JavascriptObjectNotation().stringify(data);
        this.client.close();
        resolve();
    }

}
