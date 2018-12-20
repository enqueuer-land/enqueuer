const aws = require('aws-sdk');

class Subscription {
    constructor(subscription) {
        this.subscription = subscription;
    }

    async subscribe(context) {
        this.sqs = new aws.SQS(this.subscription.awsConfiguration);
    };

    receiveMessage(context) {
        return new Promise((resolve, reject) => {
            this.sqs.receiveMessage(this.subscription.messageParams, (err, data) => {
                context.logger.trace(`SQS got data: ${JSON.stringify(data)}`);
                if (err) {
                    context.logger.error('Error receiving message from SQS');
                    return reject(err);
                } else if (data.Messages && data.Messages.length > 0) {
                    context.logger.debug('SQS got a message');
                    return resolve(data.Messages[0]);
                }
            });
        });
    };
}

module.exports = {Subscription};
