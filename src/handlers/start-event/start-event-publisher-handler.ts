import {Publisher} from "../../publishers/publisher";
import {StartEvent} from "../../start-events/start-event";
import {PrePublishMetaFunction} from "../../meta-functions/pre-publish-meta-function";
import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {DateController} from "../../dates/date-controller";
import {PublisherModel} from "../../requisitions/model/publisher-model";
import {Injectable} from "../../injector/injector";
import {Container} from "../../injector/container";

@Injectable((startEvent: any) => startEvent.publisher)
export class StartEventPublisherHandler extends StartEvent {
    private publisherOriginalAttributes: any;
    private publisher: Publisher | null = null;
    private report: any = {};
    private prePublishingReport: any = {};

    constructor(startEvent: PublisherModel) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
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
            timestamp: new DateController().toString()
        }
        if (error)
            this.report.error = error;
    }

    private executePrePublishingFunction() {
        const prePublishFunction = new PrePublishMetaFunction(this.publisherOriginalAttributes);
        const functionResponse = new MetaFunctionExecutor(prePublishFunction).execute();
        this.publisher = Container.get(Publisher).create(functionResponse.publisher);
        this.prePublishingReport = functionResponse.report;
    }
}