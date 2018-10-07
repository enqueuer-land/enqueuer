import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {Consumer, KafkaClient, Message, Offset} from 'kafka-node';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('kafka')
    .setLibrary('kafka-node')
    .registerAsSubscription();

@Injectable({predicate: (publish: any) => protocol.matches(publish.type)})
export class KafkaSubscription extends Subscription {

    private readonly client: KafkaClient;
    private options: any;
    private offset: Offset;
    private latestOffset?: number;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);

        subscriptionModel.options.requestTimeout = subscriptionModel.options.requestTimeout || 10000;
        subscriptionModel.options.connectTimeout = subscriptionModel.options.connectTimeout || 10000;
        this.options = subscriptionModel.options;
        this.client = new KafkaClient(subscriptionModel.client);
        this.offset = new Offset(this.client);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            const consumer = this.createConsumer();
            consumer.on('message', (message: Message) => {
                Logger.trace('Kafka message data: ' + new Json().stringify(message));
                resolve(message);
                consumer.close(() => {
                    Logger.trace('Kafka consumer is closed');
                });
            });

            consumer.on('error', (error: any) => {
                Logger.error('Kafka error message data: ' + new Json().stringify(error));
                reject(error);
                consumer.close(() => {
                    Logger.trace('Kafka consumer is closed');
                });
            });

        });
    }

    public async subscribe(): Promise<void> {
        const objectNotation = new Json();
        try {
            this.client.on('error', (err: any) => {
                const message = `Error subscribing to kafka ${objectNotation.stringify(err)}`;
                Logger.error(message);
                throw message;
            });
            return await this.fetchOffset();
        } catch (exc) {
            const message = `Error connecting kafka ${objectNotation.stringify(exc)}`;
            Logger.error(message);
            throw message;
        }
    }

    private fetchOffset(): Promise<void> {
        Logger.debug(`Fetching kafka subscription offset`);
        return new Promise((resolve, reject) => {
            try {
                this.offset.fetchLatestOffsets([this.options.topic], async (error: any, offsets: any) => {
                    if (error) {
                        Logger.error(`Error fetching kafka topic ${new Json().stringify(error)}`);
                        reject(error);
                    } else {
                        this.latestOffset = offsets[this.options.topic][0];
                        Logger.trace('Kafka offset fetched');
                        this.ableToUnsubscribe = true;
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public async unsubscribe(): Promise<void> {
        if (this.ableToUnsubscribe) {
            this.client.close();
        }
    }

    private createConsumer() {
        return new Consumer(
            this.client,
            [{
                topic: this.options.topic,
                offset: this.latestOffset
            }],
            {
                fromOffset: true
            }
        );
    }

}