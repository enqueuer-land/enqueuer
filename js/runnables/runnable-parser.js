"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const id_generator_1 = require("../id-generator/id-generator");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const fs_1 = __importDefault(require("fs"));
const ajv_1 = __importDefault(require("ajv"));
const yaml = __importStar(require("yamljs"));
const store_1 = require("../testers/store");
class RunnableParser {
    constructor() {
        const schemasPath = this.discoverSchemasFolder();
        this.validator = new ajv_1.default({ allErrors: true, verbose: false })
            .addSchema(this.readJsonSchemaFile(schemasPath.concat('requisition-schema.json')))
            .compile(this.readJsonSchemaFile(schemasPath.concat('runnable-schema.json')));
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
        if (!this.validator(variablesReplaced)) {
            this.throwError(variablesReplaced);
        }
        if (!variablesReplaced.id) {
            variablesReplaced.id = new id_generator_1.IdGenerator(variablesReplaced).generateId();
        }
        const runnableWithId = variablesReplaced;
        logger_1.Logger.info(`Message '${runnableWithId.name}' valid and associated with id ${runnableWithId.id}`);
        return runnableWithId;
    }
    throwError(variablesReplaced) {
        logger_1.Logger.error(`Invalid runnable: ${JSON.stringify(variablesReplaced, null, 2)}`);
        if (this.validator.errors) {
            this.validator.errors.forEach(error => {
                logger_1.Logger.error(JSON.stringify(error));
            });
            if (this.validator.errors.length > 0) {
                throw Error(this.validator.errors[0].dataPath);
            }
        }
        throw Error(JSON.stringify(this.validator, null, 2));
    }
    parseToObject(runnableMessage) {
        try {
            return yaml.parse(runnableMessage);
        }
        catch (ymlErr) {
            logger_1.Logger.warning(`Not able to parse as Yaml: ${ymlErr}`);
            try {
                return JSON.parse(runnableMessage);
            }
            catch (jsonErr) {
                logger_1.Logger.warning(`Not able to parse as Json: ${jsonErr}`);
                throw Error(JSON.stringify({ jsonError: jsonErr.toString(), ymlError: ymlErr }));
            }
        }
    }
    readJsonSchemaFile(filename) {
        return JSON.parse(fs_1.default.readFileSync(filename).toString());
    }
    replaceVariables(parsedRunnable) {
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(store_1.Store.getData());
        return placeHolderReplacer.replace(parsedRunnable);
    }
}
exports.RunnableParser = RunnableParser;
