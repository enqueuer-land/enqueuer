import { MessengerService } from "../messenger-service";

export interface RequisitionParser {
    parse(mqttRequisition: string): any;
}