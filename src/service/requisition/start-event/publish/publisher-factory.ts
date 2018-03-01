import {Publisher} from "./publisher";
import {MqttPublisher} from "./mqtt-publisher";
import {RestPublisher} from "./rest-publisher";

export class PublisherFactory {
    public createPublisher(publishRequisition: any): Publisher | null {
        if (publishRequisition.protocol === "mqtt")
            return new MqttPublisher(publishRequisition);
        if (publishRequisition.protocol === "rest")
            return new RestPublisher(publishRequisition);
        return null;

    }
}
