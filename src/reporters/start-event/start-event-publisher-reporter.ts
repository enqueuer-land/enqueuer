import {Publisher} from "../../publishers/publisher";
import {StartEventReporter} from "./start-event-reporter";
import {PrePublishMetaFunction} from "../../meta-functions/pre-publish-meta-function";
import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {DateController} from "../../timers/date-controller";
import {PublisherModel} from "../../requisitions/models/publisher-model";
import {Report} from "../report";
import {Logger} from "../../loggers/logger";
import {Injectable, Container} from "conditional-injector";

@Injectable({predicate: (startEvent: any) => startEvent.publisher != null})
export class StartEventPublisherReporter extends StartEventReporter {
    private publisherOriginalAttributes: PublisherModel;
    private publisher?: Publisher;
    private report: Report;
    private prePublishingFunctionReport: any = {};

    constructor(startEvent: PublisherModel) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {
            valid: false,
            errorsDescription: []
        };
    }

    public start(): Promise<void> {
        Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {
                this.publisher.publish()
                    .then(() => {
                        return resolve();
                    })
                    .catch((err: any) => {
                        Logger.error(err);
                        this.report.errorsDescription.push(`Error publishing start event '${this.publisher}'`)
                        reject(err)
                    });
            }
            else {
                const message = `Publisher is undefined after prePublish function execution '${this.publisher}'`;
                this.report.errorsDescription.push(message)
                reject(message);
            }
        });
    }

    public getReport(): Report {
        this.report = {
            prePublishingFunctionReport: this.prePublishingFunctionReport,
            timestamp: new DateController().toString(),
            valid: this.report.errorsDescription.length <= 0,
            errorsDescription: this.report.errorsDescription
        }
        if (this.publisher)
            this.report.type = this.publisher.type;
        if (this.publisherOriginalAttributes.name)
            this.report.name = this.publisherOriginalAttributes.name;

        return this.report;
    }

    private executePrePublishingFunction() {
        const prePublishFunction = new PrePublishMetaFunction(this.publisherOriginalAttributes);
        const functionResponse = new MetaFunctionExecutor(prePublishFunction).execute();

        if (functionResponse.publisher.payload)
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);

        Logger.trace(`Instantiating requisition publisher from '${functionResponse.publisher.type}'`);
        this.publisher = Container.subclassesOf(Publisher).create(functionResponse.publisher);
        this.prePublishingFunctionReport = functionResponse;

        this.report.errorsDescription = this.report.errorsDescription.concat(functionResponse.failingTests);
        if (functionResponse.exception) {
            this.report.errorsDescription.concat(functionResponse.exception);
        }

    }
}