const jsonSub = require('json-sub')();
const subscriptionSchema = require("../../schemas/subscription");
const publisherSchema = require("../../schemas/publisher");
const requisitionSchema = require("../../schemas/requisition");
const Ajv = require('ajv');
const ajv = new Ajv();

export class RequisitionParser {

    private validator: any;
    public constructor() {
        this.validator = ajv.addSchema(subscriptionSchema).addSchema(publisherSchema).compile(requisitionSchema);
    }

    public parse(requisitionMessage: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const parsedRequisition = JSON.parse(requisitionMessage);
                if (!this.validator(parsedRequisition)) {
                    reject(this.validator.errors);
                }
                const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
                resolve(variablesReplacedRequisition);
            } catch (err) {
                reject(err);
            }
        });
    }

    private replaceVariables(parsedRequisition: any): any {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;

        delete requisitionWithNoVariables.variables;
        return jsonSub.addresser(requisitionWithNoVariables, variables);
    }

}