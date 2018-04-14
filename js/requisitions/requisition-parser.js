"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_id_generator_1 = require("./requisition-id-generator");
const variables_controller_1 = require("../variables/variables-controller");
const place_holder_replacer_1 = require("../variables/place-holder-replacer");
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
const Ajv = require('ajv');
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
        const placeHolderReplacer = new place_holder_replacer_1.PlaceHolderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        return placeHolderReplacer.replace(parsedRequisition);
    }
}
exports.RequisitionParser = RequisitionParser;
