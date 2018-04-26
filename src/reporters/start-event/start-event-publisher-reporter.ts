import {Publisher} from "../../publishers/publisher";
import {StartEventReporter} from "./start-event-reporter";
import {PrePublishMetaFunction} from "../../meta-functions/pre-publish-meta-function";
import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {DateController} from "../../timers/date-controller";
import {PublisherModel} from "../../models/publisher-model";
import {Report, Test} from "../../reports/report";
import {Logger} from "../../loggers/logger";
import {Injectable, Container} from "conditional-injector";
import {ReportCompositor} from "../../reports/report-compositor";

@Injectable({predicate: (startEvent: any) => startEvent.publisher != null})
export class StartEventPublisherReporter extends StartEventReporter {
    private publisherOriginalAttributes: PublisherModel;
    private publisher?: Publisher;
    private reportCompositor: ReportCompositor;
    private prePublishingFunctionReport: any = {};

    constructor(startEvent: PublisherModel) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
        this.reportCompositor = new ReportCompositor(this.publisherOriginalAttributes.name);
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
                        this.reportCompositor.addTest(`Error publishing start event '${this.publisher}'`, false);
                        reject(err)
                    });
            }
            else {
                const message = `Publisher is undefined after prePublish function execution '${this.publisher}'`;
                this.reportCompositor.addTest(message, false);
                reject(message);
            }
        });
    }

    public getReport(): Report {
        this.reportCompositor.addInfo({
            prePublishingFunctionReport: this.prePublishingFunctionReport,
            timestamp: new DateController().toString(),
        });
        if (this.publisher)
            this.reportCompositor.addInfo({type: this.publisher.type});
        return this.reportCompositor.snapshot();
    }

    private executePrePublishingFunction() {
        const prePublishFunction = new PrePublishMetaFunction(this.publisherOriginalAttributes);
        const functionResponse = new MetaFunctionExecutor(prePublishFunction).execute();

        if (functionResponse.publisher.payload)
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);

        Logger.trace(`Instantiating requisition publisher from '${functionResponse.publisher.type}'`);
        this.publisher = Container.subclassesOf(Publisher).create(functionResponse.publisher);
        this.prePublishingFunctionReport = functionResponse;

        functionResponse.tests.map((passing: Test) =>
            this.reportCompositor.addTest(passing.name, passing.valid));
        if (functionResponse.exception) {
            this.reportCompositor.addTest(functionResponse.exception, false);
        }

    }
}