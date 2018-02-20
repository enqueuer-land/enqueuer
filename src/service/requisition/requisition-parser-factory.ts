import { MqttRequisitionParser } from "../../mqtt/mqtt-requisition-parser";
import { MessengerService } from "../messenger-service";
import { MqttService } from "../mqtt-service";

export class RequisitionParserFactory {
    createService(requisitionMessage: string): MessengerService {
        const requisition = JSON.parse(requisitionMessage);
        const variablesReplacedRequisition = this.replaceVariables(requisition);
        if (requisition.protocol == "mqtt")
            return new MqttService(new MqttRequisitionParser().parse(variablesReplacedRequisition));
        throw new Error(`Undefined requisition protocol: ${requisition.protocol}`);
    }
    
    private replaceVariables(requisition: any): string {
        var clone = Object.assign({}, requisition);
        delete clone.variables;
        let stringifiedRequisition = JSON.stringify(clone);

        for (const variable in requisition.variables) {
            console.log(`Replacing {{${variable}}} for ${requisition.variables[variable]}`)
            const varValue = requisition.variables[variable];
                
            stringifiedRequisition = RequisitionParserFactory.replaceAll(stringifiedRequisition,
                                            "{{"+variable+"}}",
                                            "'"+requisition.variables[variable].toString()+"'");
        }
        console.log(JSON.parse(stringifiedRequisition));
        return stringifiedRequisition;
    }

    private static escapeRegExp(str: string): string {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    private static replaceAll(str: string, find: string, replace: string): string {
        return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
}
