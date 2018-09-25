import {DateController} from '../timers/date-controller';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {SubscriptionModel} from '../models/outputs/subscription-model';
import {TestModel} from '../models/outputs/test-model';
import {PublisherModel} from '../models/outputs/publisher-model';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';

//TODO test it
export class ReportGenerator {

    private startTime?: DateController;
    private timeout?: number;

    private report: output.RequisitionModel;

    public constructor(requisitionAttributes: input.RequisitionModel) {
        this.report = RequisitionDefaultReports.createDefaultReport(requisitionAttributes.name);
    }

    public start(timeout?: number) {
        this.startTime = new DateController();
        this.timeout = timeout;
    }

    public setPublishersReport(publishersReport: PublisherModel[]): void {
        this.report.publishers = publishersReport;
    }

    public setSubscriptionsReport(subscriptionReport: SubscriptionModel[]): void {
        this.report.subscriptions = subscriptionReport;
    }

    public getReport(): RequisitionModel {
        this.report.valid = (this.report.subscriptions || []).every(report => report.valid) &&
                            (this.report.publishers || []).every(report => report.valid) &&
                            this.report.tests.every(report => report.valid);
        return this.report;
    }

    public finish(): void {
        this.addTimesReport();
    }

    public addError(error: TestModel) {
        const errorTest: TestModel = {
            valid: false,
            name: error.name,
            description: error.description
        };
        this.report.tests.push(errorTest);
    }

    public addTests(tests: TestModel[]) {
        this.report.tests = this.report.tests.concat(tests);
    }

    private addTimesReport(): void {
        if (this.startTime) {
            let timesReport = this.generateTimesReport();
            if (timesReport) {
                this.report.time = timesReport;
                const timeoutTest = this.createTimeoutTest(timesReport);
                if (timeoutTest) {
                    this.report.tests.push(timeoutTest);
                }
            }
        }
    }

    private generateTimesReport() {
        if (this.startTime) {
            const endDate = new DateController();
            return {
                startTime: this.startTime.toString(),
                endTime: endDate.toString(),
                totalTime: endDate.getTime() - this.startTime.getTime(),
                timeout: this.timeout
            };
        }
    }

    private createTimeoutTest(timesReport: any): TestModel | undefined {
        if (this.timeout) {
            const timeoutTest: TestModel = {
                valid: false,
                name: 'No time out',
                description: `Requisition has timed out: ${timesReport.totalTime} > ${this.timeout}`
            };
            if (timesReport.totalTime <= this.timeout) {
                timeoutTest.valid = true;
                timeoutTest.description = 'Requisition has not timed out';
            }
            return timeoutTest;
        }
    }
}