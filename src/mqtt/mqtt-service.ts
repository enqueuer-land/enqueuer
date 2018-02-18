import {classToClass} from "class-transformer";
import { MqttRequisitionFile, Subscription } from "./mqtt-requisition-file";
import { ReportGenerator } from "../report/report-generator";
import { Report } from "../report/report";
const mqtt = require('mqtt')

export type MqttServiceCallback = (report: Report) => void;

export class MqttService {
    private client: any;
    private mqttRequisitionFile: MqttRequisitionFile;
    private onFinishCallback: MqttServiceCallback;
    private startTime: number = 0;
    private timer: NodeJS.Timer | null = null;
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(propertyFile: MqttRequisitionFile, onFinishCallback: MqttServiceCallback) {
        this.mqttRequisitionFile = classToClass(propertyFile); //clone
        this.onFinishCallback = onFinishCallback;
        this.client = mqtt.connect(propertyFile.brokerAddress);
        this.client.on('message', 
                (topic: string, message: string) => this.onMessageReceived(topic, message));
        this.subscribeToTopics();
    }
    
    public start(): void {
        this.client.on('connect', () => this.onConnect());
    }

    private onConnect(): void {
        this.startTime = Date.now();
        this.setTimeout();
        this.publish();
    }

    private publish(): void {
        if (this.mqttRequisitionFile.publish) {
            console.log("Publishing at: " + this.mqttRequisitionFile.publish.topic);
            this.client.publish(this.mqttRequisitionFile.publish.topic,
                                this.mqttRequisitionFile.publish.payload);
        }
    }
    
    private setTimeout(): void {
        let totalTimeout = -1;
        this.mqttRequisitionFile.subscriptions.forEach(
            subscription => {
                const subscriptionTimeout = subscription.timeout;
                if (subscriptionTimeout && subscriptionTimeout > totalTimeout)
                    totalTimeout = subscriptionTimeout;
            });

        if (totalTimeout != -1) {
            console.log("Total timeout: " + totalTimeout);
            this.timer = setTimeout(() => this.onTimeout(), totalTimeout);
        } else {
            console.log("There is no total timeout");
        }
    }
    
    private onTimeout(): void {
        console.log("onTimeout");
        this.reportGenerator.addInfo("Service has timed out");
        this.client.end();
        this.onFinish();
    }
    
    private onMessageReceived(topic: string, message: string): void {
        const elapsedTime = Date.now() - this.startTime;

        console.log("Received message at: " + topic);
        this.reportGenerator.addInfo(`After: ${elapsedTime}ms, topic: ${topic} received: ${message}`);

        var index = this.mqttRequisitionFile.subscriptions.findIndex((subscription: Subscription) => {
            return subscription.topic == topic;
        });

        if (index > -1) {
            let subscription: Subscription = this.mqttRequisitionFile.subscriptions[index];
            this.mqttRequisitionFile.subscriptions.splice(index, 1);

            const testFunction: Function | null = subscription.createTestFunction();
            if (testFunction) {
                const functionResponse = testFunction(message);
                for (const test in functionResponse) {
                    if (!functionResponse[test]) {
                        const log: string = `${subscription.topic}: ${test}`;
                        this.reportGenerator.addError(log);
                    }
                }
            }

            if (this.mqttRequisitionFile.subscriptions.length === 0) {
                this.reportGenerator.addInfo("All subscriptions received messages");
                this.onFinish();
            }
        }
    }
    
    private subscribeToTopics(): void {
        this.mqttRequisitionFile.subscriptions
                .forEach((subscription: Subscription) => {
                    console.log("Subscribing to: " + subscription.topic);
                    this.client.subscribe(subscription.topic)
                });
    }

    private onFinish(): void {
        const totalTime = Date.now() - this.startTime;
        if (this.timer)
            clearTimeout(this.timer);
            this.mqttRequisitionFile.subscriptions
                .forEach((subscription: Subscription) => {
                    this.reportGenerator.addError("Topic: '" + subscription.topic + "' did not receive any message");
                });

        this.reportGenerator.addInfo("Total time: " + totalTime);
        this.client.end();
        this.onFinishCallback(this.reportGenerator.generate());
    }
}