import {Logger} from "../loggers/logger";
import {RequisitionIdGenerator} from "./requisition-id-generator";
import {RequisitionModel} from "./models/requisition-model";
import {ValidateFunction} from "ajv";
import {VariablesController} from "../variables/variables-controller";
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
const Ajv = require('ajv');
var traverse 		= require('traverse');


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
        const enqueuerReplace = substituteSync(parsedRequisition, VariablesController.persistedVariables());
        const sessionReplace = substituteSync(enqueuerReplace, VariablesController.sessionVariables());
        return sessionReplace;
    }

}

var substituteSync = function (json: any, variablesMap: any) {
    var str = JSON.stringify(json);
    var output = str.replace(/{{\w+}}/g, (placeHolder: string): string => {
        const key = placeHolder.substr(2, placeHolder.length - 4);
        const variableValue = variablesMap[key];

        if (variableValue) {
                if (typeof variableValue == 'object') {
                    // Stringify if not string yet
                    return JSON.stringify(variableValue);
                }
                return variableValue;
            }
        return placeHolder;
    });

    // Array must have the first and last " stripped
    // otherwise the JSON object won't be valid on parse
    output = output.replace(/"\[(.*)\]"/, '[$1]');

    return JSON.parse(output);
}