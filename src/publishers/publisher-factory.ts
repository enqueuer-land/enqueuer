import {Publisher} from "./publisher";
import {MqttPublisher} from "./mqtt-publisher";
import {HttpPublisher} from "./http-publisher";
import {NullPublisher} from "./null-publisher";
import {FilePublisher} from "./file-publisher";
import {StandardOutputPublisher} from "./standard-output-publisher";
import {UdsPublisher} from "./uds-publisher";
import {AmqpPublisher} from "./amqp-publisher";

export class PublisherFactory {
    public createPublisher(publishRequisition: any): Publisher {
        if (publishRequisition.type === "mqtt")
            return new MqttPublisher(publishRequisition);
        if (publishRequisition.type === "http")
            return new HttpPublisher(publishRequisition);
        if (publishRequisition.type === "file")
            return new FilePublisher(publishRequisition);
        if (publishRequisition.type === "standardOutput")
            return new StandardOutputPublisher(publishRequisition);
        if (publishRequisition.type === "uds")
            return new UdsPublisher(publishRequisition);
        if (publishRequisition.type === "amqp")
            return new AmqpPublisher(publishRequisition);
        return new NullPublisher(publishRequisition);
    }
}
