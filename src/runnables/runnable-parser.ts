import {Logger} from "../loggers/logger";
import {IdGenerator} from "../id-generator/id-generator";
import {ValidateFunction} from "ajv";
import {VariablesController} from "../variables/variables-controller";
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
import {RunnableModel} from "../models/runnable-model";
const fs = require("fs");
const Ajv = require("ajv");

export class RunnableParser {

    private validator: ValidateFunction;
    public constructor() {
        this.validator = this.schemaObjects("publishers/")
            .concat(this.schemaObjects("subscribers/"))
            .reduce((ajv, schemaObject) => ajv.addSchema(schemaObject), new Ajv({allErrors: true, verbose: true}))
            .addSchema(this.readJsonFile("schemas/requisitionSchema.json"))
            .compile(this.readJsonFile("schemas/runnableSchema.json"))
    }

    public parse(runnableMessage: string): RunnableModel {
        const parsedRunnable = JSON.parse(runnableMessage);
        if (!this.validator(parsedRunnable) && this.validator.errors) {
            Logger.error(`Invalid runnable: ${JSON.stringify(parsedRunnable, null, 2)}`);
            this.validator.errors.map(error => {
                Logger.error(JSON.stringify(error));
            })
            throw new Error(JSON.stringify(this.validator.errors, null, 2));
        }
        let variablesReplaced: any = this.replaceVariables(parsedRunnable);
        variablesReplaced.id = new IdGenerator(variablesReplaced).generateId();
        const runnableWithId: RunnableModel = variablesReplaced as RunnableModel;
        Logger.trace(`Parsed runnable: ${JSON.stringify(runnableWithId, null, 2)}`);
        Logger.info(`Message '${runnableWithId.name}' valid and associated with id ${runnableWithId.id}`)
        return runnableWithId;
    }

    private schemaObjects = (subfolderName: string): string[] => {
        let files = [];
        const path = "schemas/".concat(subfolderName);
        var dirContent = fs.readdirSync(path);
        for (var i = 0; i < dirContent.length; i++) {
            var filename = path + dirContent[i];
            var stat = fs.lstatSync(filename);
            if (!stat.isDirectory()) {
                const fileContent = this.readJsonFile(filename);
                files.push(fileContent);
            }
        }
        return files;
    }

    private readJsonFile(filename: string) {
        return JSON.parse(fs.readFileSync(filename).toString());
    }

    private replaceVariables(parsedRunnable: {}): any {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        return placeHolderReplacer.replace(parsedRunnable);
    }

}