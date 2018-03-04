import {Subscription} from "./subscription";
const mqtt = require("mqtt")

export class MqttSubscription extends Subscription {

    brokerAddress: string = "";
    topic: string = "";
    private client: any = null;

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
        this.brokerAddress = subscriptionAttributes.brokerAddress;
        this.topic = subscriptionAttributes.topic;
    }
    public receiveMessage(): Promise<void> {
        this.client.subscribe(this.topic);
        return new Promise((resolve, reject) => {
            if (!this.client.connected)
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.topic}`);

            this.client.on('message', (topic: string, message: string) =>
            {
                this.messageReceived = message.toString();
                this.removeClient();
                resolve();
            });
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
                this.removeClient();
                reject(error);
            });
        });
    }

    public unsubscribe(): void {
        this.removeClient();
    }

    private removeClient() {
        if (this.client) {
            this.client.unsubscribe(this.topic);
            this.client.end();
        }
        delete this.client;
    }

}