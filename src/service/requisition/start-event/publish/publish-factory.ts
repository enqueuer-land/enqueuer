import {Publish} from "./publish";
import {PublishMqtt} from "./publish-mqtt";
import {PublishRest} from "./publish-rest";

export class PublishFactory {
    public createPublisher(publishRequisition: any): Publish | null {
        if (publishRequisition.protocol === "mqtt")
            return new PublishMqtt(publishRequisition);
        if (publishRequisition.protocol === "rest")
            return new PublishRest(publishRequisition);
        return null;

    }
}
