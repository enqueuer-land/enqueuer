// var mqtt = require('mqtt')
// var client  = mqtt.connect('mqtt://test.mosquitto.org')
 
// client.on('connect', function () {
//   client.subscribe('presence')
//   client.publish('presence', 'Hello mqtt')
// })
 
// client.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(message.toString())
//   client.end()
// })
import { PropertyFileParser } from "./mqtt/property-file-parser";

class Startup {
  public static main(): number {
    console.log("Running");
    const propertyFile = new PropertyFileParser().parse("conf/conf.json");
    // const propertyFile = new PropertyFileParser().parse("resources/test/conf-test.json");
    console.log(propertyFile.publish.topic);
    return 0;
  }
}

Startup.main();