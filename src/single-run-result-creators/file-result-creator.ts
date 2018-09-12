import {ResultCreator} from './result-creator';
import {SingleRunResultModel} from '../models/outputs/single-run-result-model';
import * as fs from 'fs';
import * as yaml from 'yamljs';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {Logger} from '../loggers/logger';

export class FileResultCreator implements ResultCreator {
    private report: SingleRunResultModel;

    public constructor(filename: string) {
        this.report = {
            name: filename,
            tests: [],
            valid: true,
            requisitions: []
        };
    }

    public addTestSuite(name: string, report: RequisitionModel): void {
        report.name = name;
        this.report.requisitions.push(report);
        this.report.valid = this.report.valid && report.valid;
    }

    public addError(err: any): void {
        this.report.tests.push({
            description: err,
            valid: false,
            name: 'Requisition ran'
        });
        this.report.valid = false;
    }

    public isValid(): boolean {
        return this.report.valid;
    }

    public create(): void {
        let content: any = this.report;
        if (this.report.name.endsWith('yml') || this.report.name.endsWith('yaml')) {
            try {
                Logger.info(`Generating single-run yml report file: ${this.report.name}`);
                content = yaml.stringify(FileResultCreator.decycle(content), 10, 2);
            } catch (err) {
                Logger.warning(`Error generating yml report: ${err}`);
                fs.writeFileSync(this.report.name, content);
                Logger.debug(`Single-run report file created`);
                return;
            }
        } else /*if (this.report.name.endsWith('json')) */{
            Logger.info(`Generating single-run as json report file: ${this.report.name}`);
            content = JSON.stringify(content, null, 2);
        }
        fs.writeFileSync(this.report.name, content);
        Logger.debug(`Single-run report file created`);
    }

    private static decycle(decyclable: any): any {
        const cache = new Map();
        const stringified = JSON.stringify(decyclable, (key, value) => {
            if (typeof(value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }

}