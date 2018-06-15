import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as AWS from 'aws-sdk';
import {ReceiveMessageRequest, ReceiveMessageResult} from 'aws-sdk/clients/sqs';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'sqs'})
export class SqsSubscription extends Subscription {

    private params: ReceiveMessageRequest;
    private sqs: AWS.SQS;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);

        this.sqs = new AWS.SQS(subscriptionModel.awsConfiguration);
        this.params = subscriptionModel.messageParams;
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.sqs.receiveMessage(this.params, (err: AWS.AWSError, data: ReceiveMessageResult) => {
                if (err) {
                    Logger.error('Error receiving message from SQS');
                    return reject(err);
                } else if (data.Messages && data.Messages.length > 0) {
                    const stringifiedMessage = JSON.stringify(data.Messages[0], null, 2);
                    Logger.debug('SQS got a message: ' + stringifiedMessage);
                    return resolve(stringifiedMessage);
                }
            });
        });
    }

    public connect(): Promise<void> {
        return Promise.resolve();
    }

}