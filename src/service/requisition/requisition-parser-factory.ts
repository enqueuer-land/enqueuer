import { MqttRequisitionParser } from "../../mqtt/mqtt-requisition-parser";
import { MessengerService } from "../messenger-service";
import { MqttService } from "../mqtt-service";
const jsonSub = require('json-sub')();


export class RequisitionParserFactory {
    createService(requisitionMessage: string): MessengerService {
        const parsedRequisition = JSON.parse(requisitionMessage);
        const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        if (parsedRequisition.protocol == "mqtt")
            return new MqttService(new MqttRequisitionParser().parse(variablesReplacedRequisition));
        throw new Error(`Undefined requisition protocol: ${parsedRequisition.protocol}`);
    }
    
    private replaceVariables(parsedRequisition: any): string {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;
        
        delete requisitionWithNoVariables.variables;
    
        var add = jsonSub.addresser(requisitionWithNoVariables, variables);

        return JSON.stringify(add);
    }
}
