import {Publisher} from "./publisher";
import {MqttPublisher} from "./mqtt-publisher";
import {HttpPublisher} from "./http-publisher";
import {NullPublisher} from "./null-publisher";
import {FilePublisher} from "./file-publisher";
import {StandardOutputPublisher} from "./standard-output-publisher";
import {UdsPublisher} from "./uds-publisher";

export class PublisherFactory {
    public createPublisher(publishRequisition: any): Publisher {
        if (publishRequisition.protocol === "mqtt")
            return new MqttPublisher(publishRequisition);
        if (publishRequisition.protocol === "http")
            return new HttpPublisher(publishRequisition);
        if (publishRequisition.protocol === "file")
            return new FilePublisher(publishRequisition);
        if (publishRequisition.protocol === "standardOutput")
            return new StandardOutputPublisher(publishRequisition);
        if (publishRequisition.protocol === "uds")
            return new UdsPublisher(publishRequisition);
        return new NullPublisher(publishRequisition);
    }
}
