"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const id_generator_1 = require("../id-generator/id-generator");
const variables_controller_1 = require("../variables/variables-controller");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const ajv_1 = __importDefault(require("ajv"));
const yaml = __importStar(require("yamljs"));
class RunnableParser {
    constructor() {
        const schemasPath = this.discoverSchemasFolder();
        this.validator = new ajv_1.default({ allErrors: true, verbose: false })
            .addSchema(this.readJsonFile(schemasPath.concat('requisition-schema.json')))
            .compile(this.readJsonFile(schemasPath.concat('runnable-schema.json')));
    }
    discoverSchemasFolder() {
        let realPath = process.argv[1];
        try {
            realPath = fs_1.default.realpathSync(process.argv[1]);
        }
        catch (_a) {
            //do nothing
        }
        const prefix = realPath.split('enqueuer')[0];
        const schemasPath = prefix.concat('enqueuer/schemas/');
        return schemasPath;
    }
    parse(runnableMessage) {
        const parsedRunnable = this.parseToObject(runnableMessage);
        let variablesReplaced = this.replaceVariables(parsedRunnable);
        if (!this.validator(variablesReplaced) && this.validator.errors) {
            logger_1.Logger.error(`Invalid runnable: ${JSON.stringify(variablesReplaced, null, 2)}`);
            this.validator.errors.map(error => {
                logger_1.Logger.error(JSON.stringify(error));
            });
            throw new Error(JSON.stringify(this.validator.errors, null, 2));
        }
        if (util_1.isNullOrUndefined(variablesReplaced.id)) {
            variablesReplaced.id = new id_generator_1.IdGenerator(variablesReplaced).generateId();
        }
        const runnableWithId = variablesReplaced;
        logger_1.Logger.info(`Message '${runnableWithId.name}' valid and associated with id ${runnableWithId.id}`);
        return runnableWithId;
    }
    parseToObject(runnableMessage) {
        try {
            return yaml.parse(runnableMessage);
        }
        catch (err) {
            logger_1.Logger.info(`Not able to parse as Yaml string to Object. Trying to parse as JSON string`);
            return JSON.parse(runnableMessage);
        }
    }
    readJsonFile(filename) {
        return JSON.parse(fs_1.default.readFileSync(filename).toString());
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
