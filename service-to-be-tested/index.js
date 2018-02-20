var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')
 
client.on('connect', function () {
  client.subscribe('service-to-be-tested/input')
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('message', function (topic, message) {
  // message is Buffer
  console.log("Iei");
  console.log(message.toString())

  sleep(500).then(() => {
    client.publish('service-to-be-tested/output/2', 'payload2')
    const payload1 = {
      value: false
    }
    client.publish('service-to-be-tested/output/1', JSON.stringify(payload1));

  });
})