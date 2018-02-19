import { IpcCommunicator } from "./ipc-communicator";
import { MessengerService } from "../service/MessengerService";
import { MqttRequisitionParser } from "../mqtt/mqtt-requisition-parser";
import { MqttRequisition } from "../mqtt/model/mqtt-requisition";
import { MqttService } from "../service/mqtt-service";
import { Report } from "../report/report";
import { RequisitionParser } from "../service/requisition/requisition-parser";
import { RequisitionParserFactory } from "../service/requisition/requisition-parser-factory";
const mqtt = require('mqtt')

export class IpcMqtt implements IpcCommunicator {
    private messengerService: MessengerService | null = null;
    private configurations: any = null;
    private client: any;

    constructor(configurations: any) {
        this.configurations = configurations;
        this.client = mqtt.connect(configurations.brokerAddress);
    }

    start(): void {
        console.log("starting ipc-mqtt");
        this.client.on('connect', () => this.onConnect());
    }

    stop(): void {
        console.log("stopping ipc-mqtt");
        this.client.end();
    }

    private onConnect(): void {
        this.client.on('message', (topic: string, message: string) => this.onMessageReceived(topic, message));
        this.client.subscribe(this.configurations.input);
    }
    
    private onMessageReceived(topic: string, message: string): void {
        this.messengerService = new RequisitionParserFactory().createService(message);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(report));
        }
    }

    private onFinish(report: Report): void {
        this.client.publish(this.configurations.output, report.toString());
      }
    
}