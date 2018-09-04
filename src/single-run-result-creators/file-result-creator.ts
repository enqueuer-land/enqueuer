import {ResultCreator} from './result-creator';
import {SingleRunResultModel} from '../models/outputs/single-run-result-model';
import * as fs from 'fs';
import * as yaml from 'yamljs';
import {RequisitionModel} from '../models/outputs/requisition-model';

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
            content = yaml.stringify(content, 10, 2);
        } else /*if (this.report.name.endsWith('json')) */{
            content = JSON.stringify(content, null, 2);
        }
        fs.writeFileSync(this.report.name, content);
    }
}