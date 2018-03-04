import {ReportReplier} from "./report-replier";

const mqtt = require("mqtt")

export class MqttReportReplier implements ReportReplier {

    private mqttProperties: any;
    private client: any;

    constructor(mqttProperties: any) {
        this.mqttProperties = mqttProperties;
        this.client = mqtt.connect(mqttProperties.brokerAddress,
            {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
    }

    public report(report: string): boolean {
        if (this.client.connected) {
            this.client.publish(this.mqttProperties.topic, report);
            this.client.end();
            return true;
        }
        return false;
    }

}