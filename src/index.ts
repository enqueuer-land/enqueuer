import { PropertyFileParser } from "./mqtt/property-file-parser";
import { MqttService, MqttServiceCallback } from "./mqtt/mqtt-service";

class Startup {

  private mqttService: MqttService;

  constructor() {
    const propertyFile = new PropertyFileParser().parse("conf/conf.json");
    this.mqttService = new MqttService(propertyFile, this.onFinish);
  }

  public start(): number {
    console.log("start");
    this.mqttService.start();
    return 0;
  } 

  private onFinish(): void {
    console.log("over");
  }
  
}

new Startup().start();