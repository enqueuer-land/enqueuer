import { MessengerService } from "../MessengerService";

export interface RequisitionParser {
    parse(mqttRequisition: string): any;
}