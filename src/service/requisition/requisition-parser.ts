import {deserialize} from "class-transformer";
import {Requisition} from "./requisition";

const jsonSub = require('json-sub')();

export class RequisitionParser {
    parse(requisitionMessage: string): Requisition {
        const parsedRequisition = JSON.parse(requisitionMessage);
        const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        console.log("Requisition: " + variablesReplacedRequisition);
        return this.deserialize(variablesReplacedRequisition);
    }
    
    private replaceVariables(parsedRequisition: any): string {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;
        
        delete requisitionWithNoVariables.variables;
    
        var add = jsonSub.addresser(requisitionWithNoVariables, variables);

        return JSON.stringify(add);
    }
    
    private deserialize(requisition: string): any {
        try {
            return deserialize(Requisition, requisition);
        } catch (e) {
            throw new Error("Error parsing requisition: " + e);
        }
    }
}