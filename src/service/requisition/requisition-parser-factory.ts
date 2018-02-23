import { MessengerService } from "../messenger-service";
const jsonSub = require('json-sub')();
import {plainToClass, deserialize} from "class-transformer";
import { EnqueuerService } from "../enqueuer-service";
import { Requisition } from "./requisition";

export class RequisitionParserFactory {
    createService(requisitionMessage: string): MessengerService {
        const parsedRequisition = JSON.parse(requisitionMessage);
        const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        if (parsedRequisition.protocol == "mqtt") {
            return new EnqueuerService(this.parse(variablesReplacedRequisition));
        }
        throw new Error(`Undefined requisition protocol: ${parsedRequisition.protocol}`);
    }
    
    private replaceVariables(parsedRequisition: any): string {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;
        
        delete requisitionWithNoVariables.variables;
    
        var add = jsonSub.addresser(requisitionWithNoVariables, variables);

        return JSON.stringify(add);
    }
    
    private parse(requisition: string): any {
        try {
            return deserialize(Requisition, requisition);
        } catch (e) {
            throw new Error("Error parsing requisition: " + e);
        }
    }
}