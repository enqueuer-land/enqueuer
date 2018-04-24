import {Logger} from "../loggers/logger";
import {IdGenerator} from "../id-generator/id-generator";
import {ValidateFunction} from "ajv";
import {VariablesController} from "../variables/variables-controller";
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
import {RunnableModel} from "../models/runnable-model";
const fs = require("fs");
const Ajv = require("ajv");

export class RunnableParser {

    private validator?: ValidateFunction;
    public constructor() {
        this.schemaObjects()
                .reduce((ajv, schemaObject, index, array) => {
                    return (index == array.length - 1) ?
                        this.validator = ajv.compile(schemaObject)
                    :
                        ajv.addSchema(schemaObject);
                }, new Ajv({allErrors: true, verbose: true}))
    }

    public parse(runnableMessage: string): RunnableModel {
        const parsedRunnable = JSON.parse(runnableMessage);
        if (this.validator && !this.validator(parsedRunnable) && this.validator.errors) {
            Logger.error(`Invalid runnable: ${JSON.stringify(parsedRunnable, null, 2)}`);
            this.validator.errors.map(error => {
                Logger.error(JSON.stringify(error));
            })
            throw new Error(JSON.stringify(this.validator.errors));
        }
        let variablesReplaced: any = this.replaceVariables(parsedRunnable);
        variablesReplaced.id = new IdGenerator(variablesReplaced).generateId();
        const runnableWithId: RunnableModel = variablesReplaced as RunnableModel;
        Logger.trace(`Parsed runnable: ${JSON.stringify(runnableWithId, null, 2)}`);
        Logger.info(`Message '${runnableWithId.name}' valid and associated with id ${runnableWithId.id}`)
        return runnableWithId;
    }

    private schemaObjects = (): string[] => {
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
    }


    private replaceVariables(parsedRunnable: {}): any {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        return placeHolderReplacer.replace(parsedRunnable);
    }

}