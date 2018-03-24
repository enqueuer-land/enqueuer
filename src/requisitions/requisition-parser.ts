import {Logger} from "../loggers/logger";
import {RequisitionIdGenerator} from "./requisition-id-generator";
import {RequisitionModel} from "./models/requisition-model";
import {ValidateFunction} from "ajv";
const jsonSub = require('json-sub')();
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
const Ajv = require('ajv');

export class RequisitionParser {

    private validator: ValidateFunction;
    public constructor() {
        this.validator = new Ajv().addSchema(subscriptionSchema)
                            .addSchema(publisherSchema)
                            .compile(requisitionSchema);
    }

    public parse(requisitionMessage: string): RequisitionModel {
        const parsedRequisition = JSON.parse(requisitionMessage);
        if (!this.validator(parsedRequisition) && this.validator.errors) {
            throw new Error(JSON.stringify(this.validator.errors));
        }
        let variablesReplacedRequisition: any = this.replaceVariables(parsedRequisition);
        variablesReplacedRequisition.id = new RequisitionIdGenerator(variablesReplacedRequisition).generateId();
        const requisitionWithId: RequisitionModel = variablesReplacedRequisition as RequisitionModel;
        Logger.info(`Message associated with id ${requisitionWithId.id}`)
        return requisitionWithId;
    }

    private replaceVariables(parsedRequisition: any): RequisitionModel {
        let requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;

        delete requisitionWithNoVariables.variables;
        return jsonSub.addresser(requisitionWithNoVariables, variables);
    }

}