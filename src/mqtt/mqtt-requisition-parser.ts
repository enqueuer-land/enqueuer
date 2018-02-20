import { MqttRequisition } from './model/mqtt-requisition';
import {plainToClass, deserialize} from "class-transformer";
import { RequisitionParser } from '../service/requisition/requisition-parser';
import { MqttService } from '../service/mqtt-service';
import { MessengerService } from '../service/messenger-service';

export class MqttRequisitionParser implements RequisitionParser {

    parse(mqttRequisition: string): any {
        try {
            return deserialize(MqttRequisition, mqttRequisition);
        } catch (e) {
            throw new Error("Error parsing mqttRequisition: " + e);
        }
    }

}