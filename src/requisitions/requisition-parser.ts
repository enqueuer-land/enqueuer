import {Logger} from "../loggers/logger";
import {RequisitionIdGenerator} from "./requisition-id-generator";
import {RequisitionModel} from "./models/requisition-model";
import {ValidateFunction} from "ajv";
import {VariablesController} from "../variables/variables-controller";
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
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
        Logger.trace(`Parsed requisition: ${JSON.stringify(requisitionWithId, null, 2)}`);
        Logger.info(`Message associated with id ${requisitionWithId.id}`)
        return requisitionWithId;
    }

    private replaceVariables(parsedRequisition: {}): any {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        return placeHolderReplacer.replace(parsedRequisition) as RequisitionModel;
    }

}