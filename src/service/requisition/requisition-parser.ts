import {deserialize} from "class-transformer";
import {Requisition} from "./requisition";

const jsonSub = require('json-sub')();

export class RequisitionParser {
    parse(requisitionMessage: string): Requisition {
        const parsedRequisition = JSON.parse(requisitionMessage);
        const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        const requisitionReturn: Requisition = this.deserialize(variablesReplacedRequisition);
        console.log("Requisition: " + JSON.stringify(requisitionReturn, null, 2));
        return requisitionReturn;
    }
    
    private replaceVariables(parsedRequisition: any): string {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;
        
        delete requisitionWithNoVariables.variables;
    
        var add = jsonSub.addresser(requisitionWithNoVariables, variables);

        return JSON.stringify(add);
    }
    
    private deserialize(requisitionJson: string): any {
        try {
            return deserialize(Requisition, requisitionJson);
        } catch (e) {
            throw new Error("Error parsing requisition: " + e);
        }
    }
}