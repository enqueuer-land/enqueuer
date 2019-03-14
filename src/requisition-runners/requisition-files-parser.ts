import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import * as input from '../models/inputs/requisition-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as fs from 'fs';
import * as glob from 'glob';
import {RequisitionValidator} from './requisition-validator';
import {RequisitionAdopter} from '../components/requisition-adopter';

export class RequisitionFilesParser {

    private filesErrors: TestModel[] = [];

    constructor(private readonly patterns: string[]) {

    }

    public getFilesErrors(): TestModel[] {
        return this.filesErrors;
    }

    public parse(): RequisitionModel[] {
        this.filesErrors = [];
        const requisitions: input.RequisitionModel[] = [];
        const matchingFiles = this.getMatchingFiles();
        matchingFiles.forEach((file: string) => {
            try {
                requisitions.push(this.parseFile(file));
            } catch (err) {
                this.addError(`Error parsing file '${file}'`, err);
            }
        });
        if (matchingFiles.length === 0) {
            const title = `No test file was found`;
            this.addError(title, title);
        }
        return requisitions;
    }

    private parseFile(filename: string): RequisitionModel {
        const fileBufferContent = fs.readFileSync(filename).toString();
        let fileContent: any = DynamicModulesManager
            .getInstance().getObjectParserManager()
            .tryToParseWithParsers(fileBufferContent, ['yml', 'json']);

        const requisition = Array.isArray(fileContent) ? {requisitions: fileContent} : fileContent;
        const requisitionValidator = new RequisitionValidator();
        if (!requisitionValidator.validate(requisition)) {
            throw 'File \'' + filename + '\' is not a valid fileContent. ' + requisitionValidator.getErrorMessage();
        }
        requisition.name = requisition.name || filename;
        return requisition;
    }

    private getMatchingFiles(): string[] {
        let result: string[] = [];
        this.patterns.map((pattern: string) => {
            const items = glob.sync(pattern);
            if (items.length > 0) {
                result = result.concat(items.sort());
            } else {
                const message = `No file was found with: '${pattern}'`;
                this.addError(message, message);
            }
        });
        result = [...new Set(result)];

        Logger.info(`Files list: ${JSON.stringify(result, null, 2)}`);
        return result;
    }

    private addError(title: string, message: string) {
        Logger.error(message);
        this.filesErrors.push({name: title, valid: false, description: message});
    }

}
