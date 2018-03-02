import {Publisher} from "./publisher";
import {MqttPublisher} from "./mqtt-publisher";
import {HttpPublisher} from "./http-publisher";

export class PublisherFactory {
    public createPublisher(publishRequisition: any): Publisher | null {
        if (publishRequisition.protocol === "mqtt")
            return new MqttPublisher(publishRequisition);
        if (publishRequisition.protocol === "http")
            return new HttpPublisher(publishRequisition);
        return null;

    }
}
