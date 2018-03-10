import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";
const mqtt = require("mqtt")

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "mqtt")
export class MqttSubscription extends Subscription {

    private brokerAddress: string;
    private topic: string;
    private client: any;

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
        this.brokerAddress = subscriptionAttributes.brokerAddress;
        this.topic = subscriptionAttributes.topic;
    }

    public receiveMessage(): Promise<string> {
        this.client.subscribe(this.topic);
        return new Promise((resolve, reject) => {
            if (!this.client.connected)
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.topic}`);
            this.client.on('message', (topic: string, message: string) => resolve(message.toString()));
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(this.brokerAddress,
                {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
            if (!this.client.connected) {
                this.client.on("connect", () =>  resolve());
            }
            else {
                resolve();
            }
            this.client.on("error", (error: any) => {
                reject(error);
            });
        });
    }

    public unsubscribe(): void {
        if (this.client) {
            this.client.unsubscribe(this.topic);
            this.client.end();
        }
        delete this.client;
    }

}