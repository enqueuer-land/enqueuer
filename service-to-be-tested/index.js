var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')
 
client.on('connect', function () {
  client.subscribe('topicTo/#')
  client.publish('topicTo/publish', 'Hello mqtt')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log("Iei");
  console.log(message.toString())
  client.end()
})