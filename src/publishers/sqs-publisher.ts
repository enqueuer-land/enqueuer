import {Publisher} from './publisher';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Injectable} from 'conditional-injector';
import {Logger} from '../loggers/logger';
import {SendMessageRequest, SendMessageResult} from 'aws-sdk/clients/sqs';
import * as AWS from 'aws-sdk';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {ProtocolManager} from '../configurations/protocol-manager';

const protocol = ProtocolManager.getInstance()
    .insertPublisherProtocol('sqs', [], 'aws-sdk');

@Injectable({predicate: (publish: any) => protocol
        .matchesRatingAtLeast(publish.type, 95)})
export class SqsPublisher extends Publisher {

    private sqsSend: AWS.SQS;
    private params: SendMessageRequest;

    public constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);

        this.sqsSend = new AWS.SQS(publisherProperties.awsConfiguration);
        this.params = publisherProperties.messageParams || {};
        this.params.MessageBody = publisherProperties.payload;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sqsSend.sendMessage(this.messageParams, (err: AWS.AWSError, data: SendMessageResult) => {
                if (err) {
                    return reject(`Error publishing to SQS: ${err}`);
                } else {
                    this.messageReceived = data;
                    Logger.trace(`SQS send message result: ${new JavascriptObjectNotation().stringify(data)}`);
                    return resolve();
                }
            });
        });
    }

}