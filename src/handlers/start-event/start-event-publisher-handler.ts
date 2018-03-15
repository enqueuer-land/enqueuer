import {Publisher} from "../../publishers/publisher";
import {StartEventHandler} from "./start-event-handler";
import {PrePublishMetaFunction} from "../../meta-functions/pre-publish-meta-function";
import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {DateController} from "../../dates/date-controller";
import {PublisherModel} from "../../requisitions/model/publisher-model";
import {Injectable} from "../../injector/injector";
import {Container} from "../../injector/container";
import {Report} from "../../reporters/report";

@Injectable((startEvent: any) => startEvent.publisher)
export class StartEventPublisherHandler extends StartEventHandler {
    private publisherOriginalAttributes: any;
    private publisher?: Publisher;
    private report: Report;
    private prePublishingReport: any = {};

    constructor(startEvent: PublisherModel) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {valid: false};
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

    public getReport(): Report {
        return this.report;
    }

    private generateReport(error: any = null): void {
        this.report = {
            ...this.publisherOriginalAttributes,
            prePublishFunction: this.prePublishingReport,
            publisher: this.publisher,
            timestamp: new DateController().toString(),
            valid: true
        }
        if (error)
            this.report = {
                error: error,
                valid: false
            };
    }

    private executePrePublishingFunction() {
        const prePublishFunction = new PrePublishMetaFunction(this.publisherOriginalAttributes);
        const functionResponse = new MetaFunctionExecutor(prePublishFunction).execute();
        this.publisher = Container.get(Publisher).createFromPredicate(functionResponse.publisher);
        this.prePublishingReport = functionResponse.report;
    }
}