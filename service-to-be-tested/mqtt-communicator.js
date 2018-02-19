var mqtt = require('mqtt')
var fs = require('fs')
var client  = mqtt.connect('mqtt://localhost')

const goodRequisition = {
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


client.on('connect', function () {
  client.subscribe("enqueuer/output")
  const requisition  = JSON.stringify(goodRequisition, null, 2);

  console.log("requisition: " + requisition);
  client.publish('enqueuer/input', requisition);
})


client.on('message', function (topic, message) {
  console.log("Message received");
  console.log(message.toString())
  client.end();
})

