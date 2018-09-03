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
const ajv_1 = __importDefault(require("ajv"));
const fs_1 = __importDefault(require("fs"));
const yaml = __importStar(require("yamljs"));
class RequisitionParser {
    constructor() {
        const schemasPath = this.discoverSchemasFolder();
        this.validator = new ajv_1.default({ allErrors: true, verbose: false })
            .compile(this.readJsonSchemaFile(schemasPath.concat('requisition-schema.json')));
    }
    parse(message) {
        let parsed = this.parseToObject(message);
        if (!Array.isArray(parsed)) {
            parsed = [parsed];
        }
        parsed.forEach((requisition) => {
            if (!this.validator(requisition)) {
                this.throwError();
            }
        });
        return this.insertIds(parsed);
    }
    insertIds(requisitions = []) {
        requisitions
            .forEach(requisition => requisition.requisitions = this.insertIds(requisition.requisitions));
        requisitions
            .filter((item) => !item.id)
            .forEach((item) => item.id = new id_generator_1.IdGenerator(item).generateId());
        return requisitions;
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
    throwError() {
        if (this.validator.errors) {
            this.validator.errors.forEach(error => {
                logger_1.Logger.error(JSON.stringify(error));
            });
            if (this.validator.errors.length > 0) {
                throw JSON.stringify(this.validator.errors[0], null, 2);
            }
        }
        throw JSON.stringify(this.validator, null, 2);
    }
    parseToObject(message) {
        try {
            return yaml.parse(message);
        }
        catch (ymlErr) {
            logger_1.Logger.warning(`Not able to parse as Yaml: ${ymlErr}`);
            try {
                const json = JSON.parse(message);
                logger_1.Logger.debug(`Successfully parsed message as JSON`);
                return json;
            }
            catch (jsonErr) {
                logger_1.Logger.warning(`Not able to parse as Json: ${jsonErr}`);
                throw Error(JSON.stringify({ ymlError: ymlErr, jsonError: jsonErr.toString() }));
            }
        }
    }
    readJsonSchemaFile(filename) {
        return JSON.parse(fs_1.default.readFileSync(filename).toString());
    }
}
exports.RequisitionParser = RequisitionParser;
