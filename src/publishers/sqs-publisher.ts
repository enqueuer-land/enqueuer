import {Publisher} from "./publisher";
import {PublisherModel} from "../models/inputs/publisher-model";
import {Injectable} from "conditional-injector";
import {Logger} from "../loggers/logger";
import {SendMessageRequest, SendMessageResult} from "aws-sdk/clients/sqs";
import * as AWS from "aws-sdk";

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === "sqs"})
export class SqsPublisher extends Publisher {

    private sqsSend: AWS.SQS;
    private params: SendMessageRequest;

    constructor(publisherProperties: PublisherModel) {
        super(publisherProperties);

        this.sqsSend = new AWS.SQS(publisherProperties.awsConfiguration);
        this.params = publisherProperties.messageParams || {};
        this.params.MessageBody = publisherProperties.payload;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sqsSend.sendMessage(this.params, (err: AWS.AWSError, data: SendMessageResult) => {
                if (err) {
                    Logger.error("Error publishing to SQS");
                    return reject(err);
                } else {
                    this.messageReceived = JSON.stringify(data);
                    Logger.trace(`SQS send message result: ${JSON.stringify(data).substr(0, 128)}...`);
                    return resolve();
                }
            });
        });
    }

}