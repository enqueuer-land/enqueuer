import {RequisitionParentCreator} from '../components/requisition-parent-creator';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as input from '../models/inputs/requisition-model';
import * as fs from 'fs';
import * as glob from 'glob';

export class RequisitionFileParser {
    private readonly patterns: string[];
    private filesErrors: TestModel[] = [];

    constructor(patterns: string[]) {
        this.patterns = patterns;
    }

    public getFilesErrors(): TestModel[] {
        return this.filesErrors;
    }

    public parse(): RequisitionModel[] {
        this.filesErrors = [];
        const requisitions: input.RequisitionModel[] = [];
        this.getMatchingFiles()
            .forEach((file: string) => {
                try {
                    requisitions.push(this.parseFile(file));
                } catch (err) {
                    this.addError(`Error parsing file '${file}'`, err);
                }
            });
        return requisitions;
    }

    private parseFile(filename: string): RequisitionModel {
        const fileBufferContent = fs.readFileSync(filename).toString();
        const requisition: any = DynamicModulesManager
            .getInstance().getObjectParserManager()
            .tryToParseWithParsers(fileBufferContent, ['yml', 'json']);
        if (Array.isArray(requisition)) {
            return new RequisitionParentCreator().create(filename, requisition);
        }
        if (!requisition.name) {
            requisition.name = filename;
        }
        if (!this.isValidRequisition(requisition)) {
            throw 'File ' + filename + ' is not a valid requisition. ' +
            'Unable to find: \'onInit\', \'onFinish\', \'requisitions\', \'publishers\' nor \'subscriptions\'';
        }

        return requisition;
    }

    private getMatchingFiles(): string[] {
        let result: string[] = [];
        this.patterns.map((pattern: string) => {
            if (typeof (pattern) == 'string') {
                const items = glob.sync(pattern);
                if (items.length > 0) {
                    result = result.concat(items.sort());
                } else {
                    const message = `No file was found with: '${pattern}'`;
                    this.addError(message, message);
                }
            } else {
                const message = `File pattern is not a string: '${pattern}'`;
                this.addError(message, message);
            }
        });
        result = [...new Set(result)];

        Logger.info(`Files list: ${JSON.stringify(result, null, 2)}`);
        return result;
    }

    private isValidRequisition(requisition: RequisitionModel): boolean {
        return requisition.onInit !== undefined ||
            requisition.onFinish !== undefined ||
            (Array.isArray(requisition.requisitions) && requisition.requisitions.length > 0) ||
            (Array.isArray(requisition.publishers) && requisition.publishers.length > 0) ||
            (Array.isArray(requisition.subscriptions) && requisition.subscriptions.length > 0);
    }

    private addError(title: string, message: string) {
        Logger.error(message);
        this.filesErrors.push({name: title, valid: false, description: message});
    }

}
