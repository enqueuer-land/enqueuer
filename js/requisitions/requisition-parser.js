"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_id_generator_1 = require("./requisition-id-generator");
const jsonSub = require('json-sub')();
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
        let requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        let variables = parsedRequisition.variables;
        delete requisitionWithNoVariables.variables;
        return jsonSub.addresser(requisitionWithNoVariables, variables);
    }
}
exports.RequisitionParser = RequisitionParser;
