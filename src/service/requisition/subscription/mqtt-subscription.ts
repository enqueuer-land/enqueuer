import {EventCallback} from "../event-callback";
const mqtt = require("mqtt")

export class MqttSubscription {
    brokerAddress: string = "";
    topic: string = "";
    private client: any;
    private message: string = "";

    public subscribe(callback: EventCallback): boolean {
        this.client = mqtt.connect(this.brokerAddress,
            {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
        this.client.on("connect", () =>  {
            this.client.on('message',
                (topic: string, message: string) => {
                    this.message = message;
                    this.client.end(true);
                    delete this.client;
                    callback(this);
                });
        })
        return true;
    }

    public unsubscribe(): void {
        if (this.client)
            this.client.end();
        delete this.client;
    }


    toString(): string {
        console.log(`GUIGUIGUIGUIGA}`)

        const clone = Object.assign({}, this);
        delete clone.client;
        console.log(`starting ${JSON.stringify(clone)}`)
        return JSON.stringify(clone);
    }

}