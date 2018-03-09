const jsonSub = require('json-sub')();
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
import {RequisitionIdGenerator} from "./requisition-id-generator";
const Ajv = require('ajv');

export class RequisitionParser {

    private validator: any;
    public constructor() {
        this.validator = new Ajv().addSchema(subscriptionSchema)
                            .addSchema(publisherSchema)
                            .compile(requisitionSchema);
    }

    public parse(requisitionMessage: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const parsedRequisition = JSON.parse(requisitionMessage);
                if (!this.validator(parsedRequisition)) {
                    reject(this.validator.errors);
                }
                const variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
                const requisitionWithId = new RequisitionIdGenerator(variablesReplacedRequisition).insertId();
                resolve(requisitionWithId);
            } catch (err) {
                reject(err);
            }
        });
    }

    private replaceVariables(parsedRequisition: any): any {
        let requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;

        delete requisitionWithNoVariables.variables;
        return jsonSub.addresser(requisitionWithNoVariables, variables);
    }

}