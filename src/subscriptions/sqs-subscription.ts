import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as AWS from 'aws-sdk';
import {ReceiveMessageResult} from 'aws-sdk/clients/sqs';
import {Logger} from '../loggers/logger';
import {Json} from '../object-notations/json';
import {Protocol} from '../protocols/protocol';

const protocol = new Protocol('sqs')
    .setLibrary('aws-sdk')
    .registerAsSubscription();

@Injectable({predicate: (subscription: any) => protocol.matches(subscription.type)})
export class SqsSubscription extends Subscription {

    private sqs: AWS.SQS;

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);

        this.sqs = new AWS.SQS(subscriptionModel.awsConfiguration);
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.sqs.receiveMessage(this.messageParams, (err: AWS.AWSError, data: ReceiveMessageResult) => {
                Logger.trace(`SQS got data: ${new Json().stringify(data)}`);
                if (err) {
                    Logger.error('Error receiving message from SQS');
                    return reject(err);
                } else if (data.Messages && data.Messages.length > 0) {
                    const stringifiedMessage = new Json().stringify(data.Messages[0]);
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
