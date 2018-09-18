import {ResultCreator} from './result-creator';
import {SingleRunResultModel} from '../../models/outputs/single-run-result-model';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Logger} from '../../loggers/logger';
import {FilePublisher} from '../../publishers/file-publisher';

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
        const filePublisherAttributes = {
            type: 'file',
            name: this.report.name,
            filename: this.report.name
        };

        const filePublisher = new FilePublisher(filePublisherAttributes);
        filePublisher.payload = this.report;

        filePublisher.publish()
            .then(() => {
                Logger.debug(`Single-run report file created`);
            })
            .catch(err => {
                Logger.warning(`Error generating report: ${err}`);
            });
    }

}