import {DateController} from '../timers/date-controller';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {SubscriptionModel} from '../models/outputs/subscription-model';
import {checkValidation} from '../models/outputs/report-model';
import {TestModel} from '../models/outputs/test-model';
import {PublisherModel} from "../models/outputs/publisher-model";

export class ReportGenerator {

    private startTime?: DateController;
    private timeout?: number;

    private report: output.RequisitionModel;

    public constructor(requisitionAttributes: input.RequisitionModel) {
        this.report = {
            valid: true,
            tests: [],
            name: requisitionAttributes.name,
            time: {
                startTime: '',
                endTime: '',
                totalTime: 0
            },
            subscriptions: [],
            publishers: []
        };
    }

    public start(timeout?: number) {
        this.startTime = new DateController();
        this.timeout = timeout;
    }

    public setPublishersReport(publishersReport: PublisherModel[]): void {
        this.report.publishers = publishersReport;
        this.report.publishers.forEach(publisher => {
            this.report.valid = this.report.valid && publisher.valid;
        });
    }

    public setSubscriptionsReport(subscriptionReport: SubscriptionModel[]): void {
        this.report.subscriptions = subscriptionReport;
        this.report.subscriptions.forEach(subscriptionReport => {
            this.report.valid = this.report.valid && subscriptionReport.valid;
        });
    }

    public getReport(): RequisitionModel {
        this.report.valid = this.report.valid && checkValidation(this.report);
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
            let timesReport: any = {};
            const endDate = new DateController();
            timesReport.totalTime = endDate.getTime() - this.startTime.getTime();
            timesReport.startTime = this.startTime.toString();
            timesReport.endTime = endDate.toString();
            this.addTimeoutReport(timesReport);
            this.report.time = timesReport;
        }
    }

    private addTimeoutReport(timesReport: any) {
        if (this.timeout) {
            timesReport.timeout = this.timeout;
            const timeoutTest: TestModel = {
                valid: false,
                name: 'No time out',
                description: `Requisition has timed out: ${timesReport.totalTime} > ${this.timeout}`
            };
            if (timesReport.totalTime <= this.timeout) {
                timeoutTest.valid = true;
                timeoutTest.description = 'Requisition has not timed out';
            }
            this.report.tests.push(timeoutTest);
        }
    }
}