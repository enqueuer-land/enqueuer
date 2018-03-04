import {Publisher} from "../../../requisition/start-event/publish/publisher";
import {FunctionExecutor} from "../../../function-executor/function-executor";
import {StartEventType} from "./start-event-type";
import {PublisherFactory} from "../../../requisition/start-event/publish/publisher-factory";

export class StartEventPublisherHandler implements StartEventType{
    private publisher: Publisher;
    private report: any = {};
    private prePublishingReport: any = {};
    private previousPayload: string | any;

    constructor(publisher: Publisher) {
        this.publisher = new PublisherFactory().createPublisher(publisher);
        this.previousPayload = publisher.payload;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            this.publisher.execute()
                .then(() => {
                    this.generateReport();
                    resolve();
                })
                .catch((err: any) => {
                    this.generateReport(err);
                    reject(err)
                });
        });
    }

    public getReport(): any {
        return this.report;
    }

    private generateReport(error: any = null): void {
        this.report = {
            ...this.publisher,
            prePublishFunction: this.prePublishingReport,
            timestamp: new Date()
        }
        if (error)
            this.report.error = error;
        if (this.previousPayload != this.publisher.payload)
             this.report.previousPayload = this.previousPayload;
    }

    private executePrePublishingFunction() {
        const functionToExecute: Function = this.publisher.createPrePublishingFunction();
        try {
            let publisherExecutor: FunctionExecutor = new FunctionExecutor(functionToExecute);
            publisherExecutor.execute();
            this.prePublishingReport = {
                tests: {
                    failing: publisherExecutor.getFailingTests(),
                    passing: publisherExecutor.getPassingTests(),
                    exception: publisherExecutor.getException()
                },
                reports: publisherExecutor.getReports()
            }
            this.previousPayload = this.publisher.payload;
            this.publisher.payload = publisherExecutor.getFunctionResponse().payload;
        } catch (exc) {
            this.prePublishingReport = {
                onMessageReceivedFunctionCreationException: exc
            }
        }
    }
}