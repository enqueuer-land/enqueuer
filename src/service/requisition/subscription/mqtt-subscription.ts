import {EventCallback} from "../event-callback";
import {SubscriptionSuperClass} from "./subscription-super-class";
const mqtt = require("mqtt")

export class MqttSubscription extends SubscriptionSuperClass {
    brokerAddress: string = "";
    topic: string = "";
    private client: any = null;

    public subscribe(onMessageReceived: EventCallback, onSubscriptionCompleted: EventCallback): boolean {
        this.client = mqtt.connect(this.brokerAddress,
            {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
        this.client.subscribe(this.topic);
        if (!this.client.connected) {
            this.client.on("connect", () =>  {
                this.client.on('message', (topic: string, message: string) =>
                    {
                        this.message = message.toString();
                        this.client.end();
                        delete this.client;
                        onMessageReceived(this);
                    });
                onSubscriptionCompleted(this);
            });
        }
        else {
            this.client.on('message',
                (topic: string, message: string) => {
                    this.message = message.toString();
                    this.client.end(true);
                    delete this.client;
                    onMessageReceived(this);
                });
            onSubscriptionCompleted(this);
         }
        return true;
    }

    public unsubscribe(): void {
        if (this.client)
            this.client.end();
        delete this.client;
    }

}