var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')
 
client.on('connect', function () {
  client.subscribe('service-to-be-tested/input')
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log("Iei");
  console.log(message.toString())
  client.publish('service-to-be-tested/output/1', 'payload1')
  client.publish('service-to-be-tested/output/2', 'payload2')
  // client.end()
})