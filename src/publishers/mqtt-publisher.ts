import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {PublisherModel} from "../requisitions/models/publisher-model";
const mqtt = require("mqtt")

@Injectable((publishRequisition: any) => publishRequisition.type === "mqtt")
export class MqttPublisher extends Publisher {
    private brokerAddress: string;
    private topic: string;

    constructor(publish: PublisherModel) {
        super(publish);
        this.brokerAddress = publish.brokerAddress;
        this.topic = publish.topic;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connectClient()
                .then(client => {
                    client.publish(this.topic, this.payload);
                    client.end();
                    resolve()
                })
        });
    }

    private connectClient(): Promise<any> {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(this.brokerAddress,
                {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
            if (client.connected)
                resolve(client);
            else {
                client.on("connect", () =>  resolve(client));
            }
            client.on("error", (err: any) =>  reject(err));
        });
    }

}