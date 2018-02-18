import { MqttRequisitionFileParser } from "./mqtt/mqtt-requisition-file-parser";
import { MqttService, MqttServiceCallback } from "./mqtt/mqtt-service";
import { Report } from "./report/report";

class Startup {

  private mqttService: MqttService;

  constructor() {
    const mqttRequisitionFileParser = new MqttRequisitionFileParser().parse("requisitionFile.json");
    this.mqttService = new MqttService(mqttRequisitionFileParser, 
          (report: Report) => this.onFinish(report));
  }

  public start(): void {
    this.mqttService.start();
  } 

  private onFinish(report: Report): void {
    report.print();
    report.writeToFile("executionReport");
  }
  
}

new Startup().start();