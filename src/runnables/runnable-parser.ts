import {Logger} from "../loggers/logger";
import {IdGenerator} from "../id-generator/id-generator";
import {ValidateFunction} from "ajv";
import {VariablesController} from "../variables/variables-controller";
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
import {RunnableModel} from "../models/runnable-model";
const subscriptionSchema = require("../../schemas/subscriptionSchema");
const publisherSchema = require("../../schemas/publisherSchema");
const requisitionSchema = require("../../schemas/requisitionSchema");
const runnableSchema = require("../../schemas/runnableSchema");
const Ajv = require('ajv');

export class RunnableParser {

    private validator: ValidateFunction;
    public constructor() {
        this.validator = new Ajv().addSchema(subscriptionSchema)
                            .addSchema(publisherSchema)
                            .addSchema(requisitionSchema)
                            .compile(runnableSchema);
    }

    public parse(runnableMessage: string): RunnableModel {
        const parsedRunnable = JSON.parse(runnableMessage);
        if (!this.validator(parsedRunnable) && this.validator.errors) {
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
        if (runnableWithId.name)
            Logger.info(`Message '${runnableWithId.name}' associated with id ${runnableWithId.id}`)
        else
            Logger.info(`Message associated with id ${runnableWithId.id}`)
        return runnableWithId;
    }

    private replaceVariables(parsedRunnable: {}): any {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        return placeHolderReplacer.replace(parsedRunnable);
    }

}