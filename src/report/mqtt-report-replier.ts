import { ReportReplier } from "./report-replier";
import { Report } from "./report";
const mqtt = require("mqtt")

export class MqttReportReplier implements ReportReplier {

    private mqttProperties: any;
    private client: any;

    constructor(mqttProperties: any) {
        this.mqttProperties = mqttProperties;
        console.log("Morreu0: " + mqttProperties.brokerAddress)
        this.client = mqtt.connect(mqttProperties.brokerAddress,
            {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
        this.client.on('connect', () => {console.log("KAKA")});
        console.log("this.client: ");
    }

    public report(report: Report): boolean {
        console.log("Morreu15")
        this.client.publish(this.mqttProperties.topic, report.toString());
        this.client.end();
        console.log("Morreu16")
        return true;
    }

    private onConnect(report: Report) {
        console.log("Morreu1")
        this.client.publish(this.mqttProperties.topic, report.toString());
        console.log("Morreu2")
        this.client.end();
        console.log("Morreu3")

    }


}