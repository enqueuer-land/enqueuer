import {Logger} from '../loggers/logger';
import {IdGenerator} from '../id-generator/id-generator';
import {ValidateFunction} from 'ajv';
import {VariablesController} from '../variables/variables-controller';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {RunnableModel} from '../models/inputs/runnable-model';
import {isNullOrUndefined} from 'util';
import fs from 'fs';
import Ajv from 'ajv';
import * as yaml from 'yamljs';

export class RunnableParser {

    private validator: ValidateFunction;
    public constructor() {
        const schemasPath = this.discoverSchemasFolder();
        this.validator = new Ajv({allErrors: true, verbose: false})
            .addSchema(this.readJsonFile(schemasPath.concat('requisition-schema.json')))
            .compile(this.readJsonFile(schemasPath.concat('runnable-schema.json')));
    }

    private discoverSchemasFolder() {
        let realPath = process.argv[1];
        try {
            realPath = fs.realpathSync(process.argv[1]);
        } catch {
            //do nothing
        }
        const prefix = realPath.split('enqueuer')[0];
        const schemasPath = prefix.concat('enqueuer/schemas/');
        return schemasPath;
    }

    public parse(runnableMessage: string): RunnableModel {
        const parsedRunnable = this.parseToObject(runnableMessage);
        let variablesReplaced: any = this.replaceVariables(parsedRunnable);
        if (!this.validator(variablesReplaced) && this.validator.errors) {
            Logger.error(`Invalid runnable: ${JSON.stringify(variablesReplaced, null, 2)}`);
            this.validator.errors.map(error => {
                Logger.error(JSON.stringify(error));
            });
            throw new Error(JSON.stringify(this.validator.errors, null, 2));
        }
        if (isNullOrUndefined(variablesReplaced.id)) {
            variablesReplaced.id = new IdGenerator(variablesReplaced).generateId();
        }
        const runnableWithId: RunnableModel = variablesReplaced as RunnableModel;
        Logger.info(`Message '${runnableWithId.name}' valid and associated with id ${runnableWithId.id}`);
        return runnableWithId;
    }

    private parseToObject(runnableMessage: string) {
        try {
            return yaml.parse(runnableMessage);
        } catch (err) {
            Logger.info(`Not able to parse as Yaml string to Object. Trying to parse as JSON string`);
            return JSON.parse(runnableMessage);
        }
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