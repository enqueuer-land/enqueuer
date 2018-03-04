import {Publisher} from "../../publish/publisher";
import {StartEventType} from "./start-event-type";
import {PublisherFactory} from "../../publish/publisher-factory";
import {PrePublishFunctionExecutor} from "../../executor/pre-publish-function-executor";

export class StartEventPublisherHandler implements StartEventType{
    private publisherOriginalAttributes: any;
    private publisher: Publisher | null = null;
    private report: any = {};
    private prePublishingReport: any = {};

    constructor(publisher: any) {
        this.publisherOriginalAttributes = publisher;
        this.publisher = null;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {
                this.publisher.publish()
                    .then(() => {
                        this.generateReport();
                        resolve();
                    })
                    .catch((err: any) => {
                        this.generateReport(err);
                        reject(err)
                    });
            }
            else reject(`Impossible to define Publisher after prePublish function execution`);
        });
    }

    public getReport(): any {
        return this.report;
    }

    private generateReport(error: any = null): void {
        this.report = {
            ...this.publisherOriginalAttributes,
            prePublishFunction: this.prePublishingReport,
            publisher: this.publisher,
            timestamp: new Date()
        }
        if (error)
            this.report.error = error;
    }

    private executePrePublishingFunction() {
        this.prePublishingReport = new PrePublishFunctionExecutor(this.publisherOriginalAttributes).execute();
        this.publisher = new PublisherFactory()
                                        .createPublisher(this.prePublishingReport.publisher);
    }
}