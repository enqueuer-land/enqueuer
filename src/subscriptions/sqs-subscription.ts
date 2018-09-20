import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as AWS from 'aws-sdk';
import {ReceiveMessageRequest, ReceiveMessageResult} from 'aws-sdk/clients/sqs';
import {Logger} from '../loggers/logger';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'sqs'})
export class SqsSubscription extends Subscription {

    private params: ReceiveMessageRequest;
    private sqs: AWS.SQS;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);

        this.sqs = new AWS.SQS(subscriptionModel.awsConfiguration);
        this.params = subscriptionModel.messageParams;
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.sqs.receiveMessage(this.params, (err: AWS.AWSError, data: ReceiveMessageResult) => {
                Logger.trace(`SQS got data: ${new JavascriptObjectNotation().stringify(data)}`);
                if (err) {
                    Logger.error('Error receiving message from SQS');
                    return reject(err);
                } else if (data.Messages && data.Messages.length > 0) {
                    const stringifiedMessage = new JavascriptObjectNotation().stringify(data.Messages[0]);
                    Logger.debug('SQS got a message: ' + stringifiedMessage);
                    return resolve(data.Messages[0]);
                }
            });
        });
    }

    public subscribe(): Promise<void> {
        return Promise.resolve();
    }

}