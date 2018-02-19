import { MqttRequisition } from './model/mqtt-requisition';
import {plainToClass, deserialize} from "class-transformer";

export class MqttRequisitionParser {

    parse(mqttRequisition: string): MqttRequisition {
        try {
            return deserialize(MqttRequisition, mqttRequisition);
        } catch (e) {
            throw new Error("Error parsing mqttRequisition: " + e);
        }
    }

}