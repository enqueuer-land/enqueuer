import {Publisher} from "./publisher";
import {Logger} from "../loggers/logger";
import {Injectable} from "conditional-injector";
import {PublisherModel} from "../models/publisher-model";

const mqtt = require("mqtt")

@Injectable({predicate: (publishRequisition: any) => publishRequisition.type === "mqtt"})
export class MqttPublisher extends Publisher {
    private brokerAddress: string;
    private topic: string;
    private options: any;

    constructor(publish: PublisherModel) {
        super(publish);
        this.brokerAddress = publish.brokerAddress;
        this.topic = publish.topic;
        this.options = publish.options || {};
        this.options.clientId = this.options.clientId || 'mqtt_' + (1+Math.random()*4294967295).toString(16);
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connectClient()
                .then(client => {
                    Logger.debug(`Mqtt publishing in ${this.brokerAddress} - ${this.topic}: ${this.payload}`
                        .substr(0, 100).concat("..."));
                    const toPublish = typeof this.payload == 'object'? JSON.stringify(this.payload, null, 3): this.payload;
                    client.publish(this.topic, toPublish, (err: any) => {
                        if (err) {
                            Logger.error(`Error publishing in ${this.brokerAddress} - ${this.topic}: ${err}`)
                            reject(err);
                        }
                    });
                    client.end();
                    resolve()
                })
        });
    }

    private connectClient(): Promise<any> {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(this.brokerAddress, this.options);
            if (client.connected)
                resolve(client);
            else {
                client.on("connect", () =>  resolve(client));
            }
            client.on("error", (err: any) =>  reject(err));
        });
    }

}