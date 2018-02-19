
const goodRequisition = {
    "protocol": "mqtt",
    "brokerAddress": "mqtt://localhost",
    "subscriptions": [
        {
            "topic": "service-to-be-tested/output/1",
            "testFunctionBody": "test['payload value has to be true'] = true;"
        },
        {
            "timeout": 1000,
            "topic": "service-to-be-tested/output/2"
        }],
        "publish": 
        {
      "topic": "service-to-be-tested/input",
      "payload": "payload"
    }
}

const badRequisition = {
    "protocol": "mqtt",
    "brokerAddress": "mqtt://localhost",
    "subscriptions": [
        {
            "topic": "service-to-be-tested/output/1",
            "testFunctionBody": "test['payload value has to be true'] = payload.value == true; test['false value'] = false; test['should not appear'] = true;"
        },
        {
            "timeout": 100,
            "testFunctionBody": "console.log(\"requisition file log testing\")",
            "topic": "service-to-be-tested/output/2"
        },
        {
            "timeout": 5000,
            "topic": "service-to-be-tested/output/3"
        }],
        "publish": 
        {
            "topic": "service-to-be-tested/input",
            "payload": "payload"
  }
}

var ipc = require('node-ipc');

const requisition  = JSON.stringify(badRequisition, null, 2);

ipc.config.id = 'enqueuer-client';
// ipc.config.retry = 1500;
// ipc.config.silent = false;
ipc.connectTo('enqueuer', (client) => {

    client.of['enqueuer'].on('connect', () => {

        client.of['enqueuer'].on('message', message => {
            console.log("Message received");
            console.log(JSON.stringify(message))
            process.exit(0);
        });

        client.of['enqueuer'].emit('enqueuer-client', requisition);        
  });
});
