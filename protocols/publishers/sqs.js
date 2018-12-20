const aws = require('aws-sdk');

class Publisher {
    constructor(publisher) {
        this.publisher = publisher;
    }

    publish(context) {
        const sqsSend = new aws.SQS(this.publisher.awsConfiguration);
        const params = this.publisher.messageParams || {};
        params.MessageBody = this.publisher.payload;

        return new Promise((resolve, reject) => {
            sqsSend.sendMessage(params, (err, data) => {
                if (err) {
                    return reject(`Error publishing to SQS: ${err}`);
                } else {
                    resolve(data);
                }
            });
        });
    };
}

module.exports = {Publisher};
