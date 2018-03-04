import {Publisher} from "./publisher";

const mqtt = require("mqtt")

export class MqttPublisher extends Publisher {
    brokerAddress: string = "";
    topic: string = "";

    constructor(publish: any) {
        super(publish);
        if (publish) {
            this.brokerAddress = publish.brokerAddress;
            this.topic = publish.topic;
        }
    }

    public publish(publisher: Publisher): Promise<void> {
        const mqttPublisher = publisher as MqttPublisher;
        return new Promise((resolve, reject) => {
            this.connectClient(mqttPublisher)
                .then(client => {
                    client.publish(mqttPublisher.topic, mqttPublisher.payload);
                    client.end();
                    resolve()
                })
        });
    }

    private connectClient(mqttPublisher: MqttPublisher): Promise<any> {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(mqttPublisher.brokerAddress,
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