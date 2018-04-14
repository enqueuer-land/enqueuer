"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_id_generator_1 = require("./requisition-id-generator");
const variables_controller_1 = require("../variables/variables-controller");
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
const Ajv = require('ajv');
var traverse = require('traverse');
class RequisitionParser {
    constructor() {
        this.validator = new Ajv().addSchema(subscriptionSchema)
            .addSchema(publisherSchema)
            .compile(requisitionSchema);
    }
    parse(requisitionMessage) {
        const parsedRequisition = JSON.parse(requisitionMessage);
        if (!this.validator(parsedRequisition) && this.validator.errors) {
            throw new Error(JSON.stringify(this.validator.errors));
        }
        let variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        variablesReplacedRequisition.id = new requisition_id_generator_1.RequisitionIdGenerator(variablesReplacedRequisition).generateId();
        const requisitionWithId = variablesReplacedRequisition;
        logger_1.Logger.info(`Message associated with id ${requisitionWithId.id}`);
        return requisitionWithId;
    }
    replaceVariables(parsedRequisition) {
        const enqueuerReplace = substituteSync(parsedRequisition, variables_controller_1.VariablesController.persistedVariables());
        const sessionReplace = substituteSync(enqueuerReplace, variables_controller_1.VariablesController.sessionVariables());
        return sessionReplace;
    }
}
exports.RequisitionParser = RequisitionParser;
var substituteSync = function (json, variablesMap) {
    var str = JSON.stringify(json);
    var output = str.replace(/{{\w+}}/g, (placeHolder) => {
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
};
