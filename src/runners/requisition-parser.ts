import {Logger} from '../loggers/logger';
import {IdGenerator} from '../id-generator/id-generator';
import Ajv, {ValidateFunction} from 'ajv';
import fs from 'fs';
import * as yaml from 'yamljs';
import {RequisitionModel} from '../models/inputs/requisition-model';

export class RequisitionParser {

    private validator: ValidateFunction;

    public constructor() {
        const schemasPath = this.discoverSchemasFolder();
        this.validator = new Ajv({allErrors: true, verbose: false})
            .compile(this.readJsonSchemaFile(schemasPath.concat('requisition-schema.json')));
    }

    public parse(message: string): RequisitionModel[] {
        let parsed = this.parseToObject(message);
        if (!Array.isArray(parsed)) {
            parsed = [parsed];
        }
        parsed.forEach((requisition: any) => {
            if (!this.validator(requisition)) {
                this.throwError();
            }
        });
        return this.insertIds(parsed);
    }

    private insertIds(requisitions: RequisitionModel[] = []): RequisitionModel[] {
        requisitions
            .forEach(requisition => requisition.requisitions = this.insertIds(requisition.requisitions));
        requisitions
            .filter((item: RequisitionModel) => !item.id)
            .forEach((item: RequisitionModel) => item.id = new IdGenerator(item).generateId());
        return requisitions;
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

    private throwError() {
        if (this.validator.errors) {
            this.validator.errors.forEach(error => {
                Logger.error(JSON.stringify(error));
            });
            if (this.validator.errors.length > 0) {
                throw JSON.stringify(this.validator.errors[0], null, 2);
            }
        }
        throw JSON.stringify(this.validator, null, 2);
    }

    private parseToObject(message: string) {
        try {
            return yaml.parse(message);
        } catch (ymlErr) {
            Logger.warning(`Not able to parse as Yaml: ${ymlErr}`);
            try {
                const json = JSON.parse(message);
                Logger.debug(`Successfully parsed message as JSON`);
                return json;
            } catch (jsonErr) {
                Logger.warning(`Not able to parse as Json: ${jsonErr}`);
                throw Error(JSON.stringify({ymlError: ymlErr, jsonError: jsonErr.toString()}));
            }
        }
    }

    private readJsonSchemaFile(filename: string) {
        return JSON.parse(fs.readFileSync(filename).toString());
    }

}