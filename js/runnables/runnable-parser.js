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
        this.readFilesFromSchemaFolders = (subfolderName) => {
            let files = [];
            var dirContent = fs.readdirSync(subfolderName);
            for (var i = 0; i < dirContent.length; i++) {
                var filename = subfolderName + dirContent[i];
                var stat = fs.lstatSync(filename);
                if (!stat.isDirectory()) {
                    const fileContent = this.readJsonFile(filename);
                    files.push(fileContent);
                }
            }
            return files;
        };
        const schemasPath = this.discoverSchemasFolder();
        this.validator = this.readFilesFromSchemaFolders(schemasPath.concat("publishers/"))
            .concat(this.readFilesFromSchemaFolders(schemasPath.concat("subscribers/")))
            .reduce((ajv, schemaObject) => ajv.addSchema(schemaObject), new Ajv({ allErrors: true, verbose: false }))
            .addSchema(this.readJsonFile(schemasPath.concat("requisition-schema.json")))
            .compile(this.readJsonFile(schemasPath.concat("runnable-schema.json")));
    }
    discoverSchemasFolder() {
        let realPath = process.argv[1];
        try {
            realPath = fs.realpathSync(process.argv[1]);
        }
        catch (_a) {
        }
        const prefix = realPath.split("enqueuer")[0];
        const schemasPath = prefix.concat("enqueuer/schemas/");
        return schemasPath;
    }
    parse(runnableMessage) {
        const parsedRunnable = JSON.parse(runnableMessage);
        if (!this.validator(parsedRunnable) && this.validator.errors) {
            logger_1.Logger.error(`Invalid runnable: ${JSON.stringify(parsedRunnable, null, 2)}`);
            this.validator.errors.map(error => {
                logger_1.Logger.error(JSON.stringify(error));
            });
            throw new Error(JSON.stringify(this.validator.errors, null, 2));
        }
        let variablesReplaced = this.replaceVariables(parsedRunnable);
        variablesReplaced.id = new id_generator_1.IdGenerator(variablesReplaced).generateId();
        const runnableWithId = variablesReplaced;
        logger_1.Logger.trace(`Parsed runnable: ${JSON.stringify(runnableWithId, null, 2)}`);
        logger_1.Logger.info(`Message '${runnableWithId.name}' valid and associated with id ${runnableWithId.id}`);
        return runnableWithId;
    }
    readJsonFile(filename) {
        return JSON.parse(fs.readFileSync(filename).toString());
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
