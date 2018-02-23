import { MessengerService } from "../messenger-service";

export interface RequisitionParser {
    parse(requisition: string): any;
}