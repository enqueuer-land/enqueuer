const jsonSub = require('json-sub')();

export class RequisitionParser {
    parse(requisitionMessage: string): any {
        const parsedRequisition = JSON.parse(requisitionMessage);
        //TODO: validate requisition
        const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        return variablesReplacedRequisition;
    }
    
    private replaceVariables(parsedRequisition: any): any {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;
        
        delete requisitionWithNoVariables.variables;
        return jsonSub.addresser(requisitionWithNoVariables, variables);
    }
}