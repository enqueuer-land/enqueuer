import { MqttRequisitionParser } from "../../mqtt/mqtt-requisition-parser";
import { MessengerService } from "../MessengerService";
import { MqttService } from "../mqtt-service";

export class RequisitionParserFactory {
    createService(requisitionMessage: string): MessengerService {
        const requisition = JSON.parse(requisitionMessage);
        if (requisition.protocol == "mqtt")
            return new MqttService(new MqttRequisitionParser().parse(requisitionMessage));
        throw new Error(`Undefined requisition protocol: ${requisition.protocol}`);
    }
}
