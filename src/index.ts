import { MqttRequisitionFileParser } from "./mqtt/mqtt-requisition-file-parser";
import { MqttService } from "./service/mqtt-service";
import { Report } from "./report/report";

class Startup {

  private mqttService: MqttService;

  constructor() {
    const mqttRequisitionFileParser = new MqttRequisitionFileParser().parse("requisitionFile.json");
    this.mqttService = new MqttService(mqttRequisitionFileParser);
  }

  public start(): void {
    this.mqttService.start((report: Report) => this.onFinish(report));
  } 

  private onFinish(report: Report): void {
    report.print();
    report.writeToFile("executionReport");
  }
  
}

new Startup().start();