"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const id_generator_1 = require("../id-generator/id-generator");
const variables_controller_1 = require("../variables/variables-controller");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
const runnableSchema = require("../../schemas/runnableSchema");
const Ajv = require('ajv');
class RunnableParser {
    constructor() {
        this.validator = new Ajv().addSchema(subscriptionSchema)
            .addSchema(publisherSchema)
            .addSchema(requisitionSchema)
            .compile(runnableSchema);
    }
    parse(runnableMessage) {
        const parsedRunnable = JSON.parse(runnableMessage);
        if (!this.validator(parsedRunnable) && this.validator.errors) {
            logger_1.Logger.error(`Invalid runnable: ${JSON.stringify(parsedRunnable, null, 2)}`);
            this.validator.errors.map(error => {
                logger_1.Logger.error(JSON.stringify(error));
            });
            throw new Error(JSON.stringify(this.validator.errors));
        }
        let variablesReplaced = this.replaceVariables(parsedRunnable);
        variablesReplaced.id = new id_generator_1.IdGenerator(variablesReplaced).generateId();
        const runnableWithId = variablesReplaced;
        logger_1.Logger.trace(`Parsed runnable: ${JSON.stringify(runnableWithId, null, 2)}`);
        if (runnableWithId.name)
            logger_1.Logger.info(`Message '${runnableWithId.name}' associated with id ${runnableWithId.id}`);
        else
            logger_1.Logger.info(`Message associated with id ${runnableWithId.id}`);
        return runnableWithId;
    }
    replaceVariables(parsedRunnable) {
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        return placeHolderReplacer.replace(parsedRunnable);
    }
}
exports.RunnableParser = RunnableParser;
