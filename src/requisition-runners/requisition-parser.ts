import {Logger} from '../loggers/logger';
import {IdGenerator} from '../timers/id-generator';
import Ajv, {ValidateFunction} from 'ajv';
import fs from 'fs';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';

export class RequisitionParser {

    private validator: ValidateFunction;

    public constructor() {
        const schemasPath = this.discoverSchemasFolder();
        this.validator = new Ajv({allErrors: true, verbose: false})
            .compile(this.readJsonSchemaFile(schemasPath.concat('requisition-schema.json')));
    }

    public parse(message: string): RequisitionModel[] {
        let parsed: any = new MultipleObjectNotation().parse(message);
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
                Logger.error(new JavascriptObjectNotation().stringify(error) as string);
            });
            if (this.validator.errors.length > 0) {
                throw new JavascriptObjectNotation().stringify(this.validator.errors[0]);
            }
        }
        throw new JavascriptObjectNotation().stringify(this.validator);
    }

    private readJsonSchemaFile(filename: string) {
        return new JavascriptObjectNotation().parse(fs.readFileSync(filename).toString());
    }

}