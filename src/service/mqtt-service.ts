import {classToClass} from "class-transformer";
import { MqttRequisition, Subscription } from "../mqtt/model/mqtt-requisition";
import { ReportGenerator } from "../report/report-generator";
import { Report } from "../report/report";
import { MessengerService, MessengerServiceCallback } from "../service/MessengerService";
const mqtt = require('mqtt')

export class MqttService implements MessengerService {
    private client: any;
    private mqttRequisition: MqttRequisition;
    private onFinishCallback: MessengerServiceCallback | null = null;
    private startTime: number = 0;
    private timer: NodeJS.Timer | null = null;
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(mqttRequisition: MqttRequisition) {
        this.mqttRequisition = classToClass(mqttRequisition); //clone
        this.client = mqtt.connect(mqttRequisition.brokerAddress);
        this.client.on('message', 
                    (topic: string, message: string) => this.onMessageReceived(topic, message));
        this.subscribeToTopics();
    }
    
    public start(onFinishCallback: MessengerServiceCallback): void {
        this.onFinishCallback = onFinishCallback;
        this.client.on('connect', () => this.onConnect());
    }

    private onConnect(): void {
        this.startTime = Date.now();
        this.setTimeout();
        this.publish();
    }

    private publish(): void {
        if (this.mqttRequisition.publish) {
            this.client.publish(this.mqttRequisition.publish.topic,
                                this.mqttRequisition.publish.payload);
        }
    }
    
    private setTimeout(): void {
        let totalTimeout = -1;
        this.mqttRequisition.subscriptions.forEach(
            (subscription: Subscription) => {
                const subscriptionTimeout = subscription.timeout;
                if (subscriptionTimeout && subscriptionTimeout > totalTimeout)
                    totalTimeout = subscriptionTimeout;
            });

        if (totalTimeout != -1) {
            this.timer = setTimeout(() => this.onTimeout(), totalTimeout);
        }
    }
    
    private onTimeout(): void {
        this.reportGenerator.addInfo("Service has timed out");
        this.client.end();
        this.onFinish();
    }
    
    private onMessageReceived(topic: string, message: string): void {
        const ellapsedTime = Date.now() - this.startTime;

        this.reportGenerator.addInfo(`After: ${ellapsedTime}ms, topic: ${topic} received: ${message}`);

        var index = this.mqttRequisition.subscriptions.findIndex((subscription: Subscription) => {
            return subscription.topic == topic;
        });

        if (index > -1) {
            let subscription: Subscription = this.mqttRequisition.subscriptions[index];
            this.mqttRequisition.subscriptions.splice(index, 1);


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

            if (subscription.timeout && subscription.timeout < ellapsedTime) {
                const log: string = `${subscription.topic}: ellapsed time (${ellapsedTime}ms) is greater than timeout (${subscription.timeout}ms)`;
                this.reportGenerator.addError(log);
            }

            if (this.mqttRequisition.subscriptions.length === 0) {
                this.reportGenerator.addInfo("All subscriptions received messages");
                this.onFinish();
            }
        }
    }
    
    private subscribeToTopics(): void {
        this.mqttRequisition.subscriptions
                .forEach((subscription: Subscription) => {
                    this.client.subscribe(subscription.topic)
                });
    }

    private onFinish(): void {
        const totalTime = Date.now() - this.startTime;
        if (this.timer)
            clearTimeout(this.timer);
            this.mqttRequisition.subscriptions
                .forEach((subscription: Subscription) => {
                    this.reportGenerator.addError("Topic: '" + subscription.topic + "' did not receive any message");
                });

        this.reportGenerator.addInfo(`Total time:  + ${totalTime}ms`);
        this.client.end();
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    }
}