import {Publisher} from "../../requisition/start-event/publish/publisher";
import {FunctionExecutor} from "../../function-executor/function-executor";
import {StartEventType} from "./start-event-type";
import {PublisherFactory} from "../../requisition/start-event/publish/publisher-factory";

export class StartEventPublisherHandler implements StartEventType{
    private originalPublisher: Publisher;
    private publisherAfterFunction: Publisher;
    private report: any = {};
    private prePublishingReport: any = {};

    constructor(publisher: Publisher) {
        this.originalPublisher = new PublisherFactory().createPublisher(publisher);
        this.publisherAfterFunction = this.originalPublisher;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            this.originalPublisher.publish(this.publisherAfterFunction)
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
            ...this.originalPublisher,
            prePublishFunction: this.prePublishingReport,
            timestamp: new Date()
        }
        if (error)
            this.report.error = error;
        if (this.originalPublisher != this.publisherAfterFunction)
             this.report.publisherAfterFunction = this.publisherAfterFunction;
    }

    private executePrePublishingFunction() {
        const functionToExecute: Function = this.originalPublisher.createPrePublishingFunction();
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
            this.publisherAfterFunction = publisherExecutor.getFunctionResponse().originalPublisher;
        } catch (exc) {
            this.prePublishingReport = {
                onMessageReceivedFunctionCreationException: exc
            }
        }
    }
}