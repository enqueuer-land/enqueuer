import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {KafkaClient, Consumer, Offset, Message} from 'kafka-node';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'kafka'})
export class KafkaSubscription extends Subscription {

    private client: KafkaClient;
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

            const consumer = new Consumer(
                this.client,
                [{
                    topic: this.options.topic,
                    offset: this.latestOffset
                }],
                {
                    fromOffset: true
                }
            );

            consumer.on('message', (message: Message) => {
                Logger.trace('Kafka message data: ' + JSON.stringify(message, null, 2));
                resolve(message.value);
                consumer.close(() => {
                    Logger.trace('Kafka consumer is closed');
                });
            });

            consumer.on('error', (error: any) => {
                Logger.error('Kafka error message data: ' + JSON.stringify(error, null, 2));
                reject(error);
                consumer.close(() => {
                    Logger.trace('Kafka consumer is closed');
                });
            });

        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.offset.fetchLatestOffsets([this.options.topic], (error: any, offsets: any) => {
                    if (error) {
                        Logger.error(`Error fetching kafka topic ${JSON.stringify(error, null, 2)}`);
                        reject(error);
                    } else {
                        this.latestOffset = offsets[this.options.topic][0];
                        Logger.trace('Kafka subscription is connected');
                        resolve();
                    }
                });
                this.offset.on('error', (error) => {
                    Logger.error(`Error offset kafka ${JSON.stringify(error, null, 2)}`);
                    reject(error);
                });
            } catch (exc) {
                Logger.error(`Error connecting kafka ${JSON.stringify(exc, null, 2)}`);
                reject(exc);
            }
        });
    }

    public unsubscribe() {
        this.client.close();
    }
}