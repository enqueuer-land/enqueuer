import {DateController} from '../timers/date-controller';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {SubscriptionModel} from '../models/outputs/subscription-model';
import {TestModel} from '../models/outputs/test-model';
import {PublisherModel} from '../models/outputs/publisher-model';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';

export class RequisitionReportGenerator {

    private startTime: DateController = new DateController();
    private readonly timeout?: number;
    private readonly report: output.RequisitionModel;

    public constructor(requisitionAttributes: input.RequisitionModel, timeout?: number) {
        this.report = RequisitionDefaultReports.createDefaultReport(requisitionAttributes);
        this.report.id = requisitionAttributes.id;
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
        this.report.time = this.generateTimesReport();
        if (this.timeout) {
            this.report.time.timeout = this.timeout;
            if (this.report.time.totalTime > this.report.time.timeout) {
                this.report.tests.push({
                    valid: false,
                    name: 'No time out',
                    description: `Requisition has timed out: ${this.report.time.totalTime} > ${this.timeout}`
                });
            }

        }
    }

    private generateTimesReport() {
        const endDate = new DateController();
        return {
            startTime: this.startTime.toString(),
            endTime: endDate.toString(),
            totalTime: endDate.getTime() - this.startTime.getTime()
        };
    }

}
