import { MqttRequisitionFileParser } from "./mqtt/mqtt-requisition-file-parser";
import { MqttService } from "./service/mqtt-service";
import { Report } from "./report/report";
import { MessengerService } from "./service/MessengerService";
const fs = require('fs');

class Startup {

  private messengerService: MessengerService;

  constructor() {
    const mqttRequisitionFileParser = new MqttRequisitionFileParser().parse("requisitionFile.json");
    this.messengerService = new MqttService(mqttRequisitionFileParser);
  }

  public start(): void {
    this.messengerService.start((report: Report) => this.onFinish(report));
  } 

  private onFinish(report: Report): void {
    report.print();
    fs.writeFileSync("executionReport", report.toString(), 'utf8');
  }
  
}

new Startup().start();