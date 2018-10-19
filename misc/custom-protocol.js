const Stomp = require('stomp-client');

const subscribe = (subscription, context) => {
    return new Promise((resolve, reject) => {
        context.logger.debug(`Stomp subscription connecting to ${subscription.address}:${subscription.port}`);
        subscription.client = new Stomp(subscription.address, subscription.port, subscription.user, subscription.password);
        subscription.client.connect((sessionId) => {
            context.logger.debug(`connected id ${sessionId}`);
            resolve();
        }, (err) => {
            reject(err);
        });
    });
};

const receiveMessage = (subscription, context) => {
    return new Promise((resolve, reject) => {
        context.logger.trace(`Stomp waiting for a message related to queue ${subscription.queue}`);
        const gotMessage = (message, headers) => {
            context.logger.trace(`e received header ${JSON.stringify(headers)}`);
            resolve({payload: message, headers: headers});
        };
        subscription.client.subscribe(subscription.queue, gotMessage);
        subscription.client.on('message', gotMessage);
        subscription.client.once('error', (err) => {
            reject(err);
        });
    });
};

const publish = (publisher, context) => {
    return new Promise((resolve, reject) => {
        const client = new Stomp(publisher.address, publisher.port, publisher.user, publisher.password);
        client.connect((sessionId) => {
            context.logger.debug(`Stomp publisher connected id ${sessionId}`);
            client.publish(publisher.queue, publisher.payload);
            resolve();
        }, (err) => {
            context.logger.error(`Error connecting to stomp to publish: ${err}`);
            reject(err);
        });
    });
};

module.exports = {subscribe, receiveMessage, publish};
