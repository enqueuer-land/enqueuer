import {Publisher} from '../../publishers/publisher';
import {StartEventReporter} from './start-event-reporter';
import {PrePublishMetaFunctionBody} from '../../meta-functions/pre-publish-meta-function-body';
import {MetaFunctionExecutor} from '../../meta-functions/meta-function-executor';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {Injectable, Container} from 'conditional-injector';
import {OnMessageReceivedReporter} from '../../meta-functions/on-message-received-reporter';
import {StartEventModel} from '../../models/outputs/start-event-model';
import {checkValidation} from '../../models/outputs/report-model';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {VariablesController} from '../../variables/variables-controller';

@Injectable({predicate: (startEvent: any) => startEvent.publisher != null})
export class StartEventPublisherReporter extends StartEventReporter {
    private publisherOriginalAttributes: input.PublisherModel;
    private publisher?: Publisher;
    private report: output.PublisherModel;

    constructor(startEvent: input.PublisherModel) {
        super();
        this.publisherOriginalAttributes = startEvent.publisher;
        this.report = {
            name: this.publisherOriginalAttributes.name,
            valid: true,
            type: this.publisherOriginalAttributes.type,
            tests: {
                'Published': false
            }
        };
    }

    public start(): Promise<void> {
        Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.executePrePublishingFunction();
            if (this.publisher) {

                this.publisher.publish()
                    .then(() => {
                        Logger.trace(`Start event published`);
                        this.report.publishTime = new DateController().toString();
                        this.report.tests['Published'] = true;
                        this.executeOnMessageReceivedFunction();
                        return resolve();
                    })
                    .catch((err: any) => {
                        Logger.error(err);
                        this.report.tests[`Error publishing start event '${JSON.stringify(this.publisher, null, 2)}'`] = false;
                        reject(err);
                    });
            } else {
                const message = `Publisher is undefined after prePublish function execution '${this.publisher}'`;
                this.report.tests[message] = false;
                reject(message);
            }
        });
    }

    public getReport(): StartEventModel {
        this.report.valid = this.report.valid && checkValidation(this.report);
        return {
            publisher: this.report
        };
    }

    private executeOnMessageReceivedFunction() {
        if (!this.publisher || !this.publisher.messageReceived || !this.publisher.onMessageReceived) {
            return;
        }
        const onMessageReceivedReporter = new OnMessageReceivedReporter(this.publisher.messageReceived, this.publisher.onMessageReceived);
        const functionResponse = onMessageReceivedReporter.execute();
        functionResponse.tests
            .map((test: any) => this.report.tests[test.name] = test.valid);
    }

    private executePrePublishingFunction() {
        const prePublishFunction = new PrePublishMetaFunctionBody(this.publisherOriginalAttributes);
        let functionResponse = new MetaFunctionExecutor(prePublishFunction).execute();

        Logger.debug(`PrePublishingFunctionReport: ${JSON.stringify(functionResponse, null, 3)}`);
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        functionResponse = (placeHolderReplacer.replace(functionResponse) as any);
        Logger.debug(`Replaced PrePublishingFunctionReport: ${JSON.stringify(functionResponse, null, 3)}`);

        if (functionResponse.publisher.payload) {
            functionResponse.publisher.payload = JSON.stringify(functionResponse.publisher.payload);
        }

        Logger.trace(`Instantiating requisition publisher from '${functionResponse.publisher.type}'`);
        this.publisher = Container.subclassesOf(Publisher).create(functionResponse.publisher);

        functionResponse.tests
            .map((test: any) => this.report.tests[test.name] = test.valid);
        if (functionResponse.exception) {
            this.report.tests[functionResponse.exception] = false;
        }

    }
}