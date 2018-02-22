// import { ReportReplier } from "./report-replier";
// import { Report } from "./report";
// const mqtt = require('mqtt')

// export class MqttReportReplier implements ReportReplier {

//     private mqttProperties: any;
//     private client: any;
//     private connected: boolean = false;
    
//     constructor(mqttProperties: any) {
//         this.mqttProperties = mqttProperties;
//         this.client = mqtt.connect(mqttProperties.brokerAddress);
//     }
    
//     public report(report: Report): boolean {
//         this.client.on('connect', () => {
//             this.client.publish(this.mqttProperties.topic, report.toString());
//             this.client.end();
//         });
//         return true;
//     }

// }