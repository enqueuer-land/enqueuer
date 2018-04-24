"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const id_generator_1 = require("../id-generator/id-generator");
const variables_controller_1 = require("../variables/variables-controller");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const fs = require("fs");
const Ajv = require("ajv");
class RunnableParser {
    constructor() {
        this.schemaObjects = () => {
            let files = [];
            const path = "schemas/";
            var dirContent = fs.readdirSync(path);
            for (var i = 0; i < dirContent.length; i++) {
                var filename = path + dirContent[i];
                var stat = fs.lstatSync(filename);
                if (!stat.isDirectory()) {
                    const fileContent = fs.readFileSync(filename).toString();
                    files.push(JSON.parse(fileContent));
                }
            }
            return files;
        };
        this.schemaObjects()
            .reduce((ajv, schemaObject, index, array) => {
            return (index == array.length - 1) ?
                this.validator = ajv.compile(schemaObject)
                :
                    ajv.addSchema(schemaObject);
        }, new Ajv({ allErrors: true, verbose: true }));
    }
    parse(runnableMessage) {
        const parsedRunnable = JSON.parse(runnableMessage);
        if (this.validator && !this.validator(parsedRunnable) && this.validator.errors) {
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
