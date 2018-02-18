import { MqttRequisitionFile, Subscriptions } from "./mqtt-requisition-file";
const Stream = require("ts-stream").Stream; // CommonJS style
const mqtt = require('mqtt')

export type MqttServiceCallback = () => void;

export class MqttService {
    private client: any;
    private mqttRequisitionFile: MqttRequisitionFile;
    private subscribedTopics: string[] = [];
    private onFinishCallback: MqttServiceCallback;
    private startTime: number = 0;
    private totalTime: number = 0;
    private timer: NodeJS.Timer | null = null;

    constructor(propertyFile: MqttRequisitionFile, onFinishCallback: MqttServiceCallback) {
        this.mqttRequisitionFile = propertyFile;
        this.onFinishCallback = onFinishCallback;
        this.client = mqtt.connect(propertyFile.brokerAddress);
        this.client.on('message', 
                (topic: string, message: string) => this.onMessageReceived(topic, message));
        this.subscribeToTopics();
        console.log("Service built");
    }
    
    public start(): void {
        this.client.on('connect', () => this.onConnect());
    }

    public getTotalTime(): number {
        return this.totalTime;
    }
    
    private onConnect(): void {
        this.startTime = Date.now();
        console.log("Publishing at: " + this.mqttRequisitionFile.publish.topic);
        this.client.publish(this.mqttRequisitionFile.publish.topic,
                            this.mqttRequisitionFile.publish.payload);
        this.timer = setTimeout(() => this.onTimeout(), this.mqttRequisitionFile.totalTimeout);
    }
    
    private onTimeout(): void {
        console.log("onTimeout");
        this.client.end();
        this.onFinish();
    }
    
    private onMessageReceived(topic: string, message: string): void {
        console.log("Received message at: " + topic);
        var index = this.subscribedTopics.indexOf(topic, 0);
        if (index > -1) {
            this.subscribedTopics.splice(index, 1);
        }
        if (this.subscribedTopics.length === 0) {
            console.log("No more topics to receive message");
            this.onFinish();
        }
    }
    
    private subscribeToTopics(): void {
        Stream.from(this.mqttRequisitionFile.subscriptions)
                .forEach((subscription: Subscriptions) => {
                    console.log("Subscribing to: " + subscription.topic);
                    this.client.subscribe(subscription.topic)
                    this.subscribedTopics.push(subscription.topic);
                });
    }

    private onFinish(): void {
        this.totalTime = Date.now() - this.startTime;
        if (this.timer)
            clearTimeout(this.timer);
        console.log("Service finished its job");
        Stream.from(this.subscribedTopics)
            .forEach((topic: string) => {
                console.log("Topic: " + topic + " did not receive any message");
            });

        this.client.end();
        this.onFinishCallback();
    }
}