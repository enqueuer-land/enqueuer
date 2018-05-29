import {Subscription} from "./subscription";
import {Logger} from "../loggers/logger";
import {Injectable} from "conditional-injector";
import {SubscriptionModel} from "../models/inputs/subscription-model";

const mqtt = require("mqtt")

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === "mqtt"})
export class MqttSubscription extends Subscription {

    private brokerAddress: string;
    private topic: string;
    private client: any;
    private options: any;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.brokerAddress = subscriptionAttributes.brokerAddress;
        this.topic = subscriptionAttributes.topic;
        this.options = subscriptionAttributes.options || {};
        this.options.clientId = this.options.clientId || 'mqtt_' + (1+Math.random()*4294967295).toString(16);
    }

    public receiveMessage(): Promise<string> {
        Logger.trace(`Mqtt subscribing on topic ${this.topic}`);
        this.client.subscribe(this.topic);
        return new Promise((resolve, reject) => {
            if (!this.client.connected)
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.topic}`);
            this.client.on('message', (topic: string, message: string) => resolve(message.toString()));
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(this.brokerAddress, this.options);
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
            this.client.end(true);
        }
        delete this.client;
    }

}