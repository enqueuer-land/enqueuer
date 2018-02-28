const mqtt = require("mqtt")

export class PublishMqtt {
    brokerAddress: string = "";
    topic: string = "";
    payload: string = "";

    publish(): boolean {

        const client = mqtt.connect(this.brokerAddress,
            {clientId: 'mqtt_' + (1+Math.random()*4294967295).toString(16)});
        if (client.connected) {
            client.publish(this.topic, this.payload);
            client.end();
            return true;
        }
        else {
            client.on("connect", () =>  {
                client.publish(this.topic, this.payload);
                client.end();
                return true;
            });
        }
        return false;
    }

}