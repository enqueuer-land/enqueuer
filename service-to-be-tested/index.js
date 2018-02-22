var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')
 
client.on('connect', function () {
  console.log("connected")
  client.subscribe('service-to-be-tested/input')
  client.subscribe('service-to-be-tested/report')
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('message', function (topic, message) {
  if (topic === 'service-to-be-tested/input') {
    
    sleep(500).then(() => {
      client.publish('service-to-be-tested/output/2', 'payload2')
      const payload1 = {
        value: false
      }
      client.publish('service-to-be-tested/output/1', JSON.stringify(payload1));
      
    });
  } else {
    console.log("-----REPORT-----")
    // message is Buffer
    console.log(topic)
    console.log(message.toString())
  }
})