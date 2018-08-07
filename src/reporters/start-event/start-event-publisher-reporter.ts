import {Publisher} from '../../publishers/publisher';
import {StartEventReporter} from './start-event-reporter';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {StartEventModel} from '../../models/outputs/start-event-model';
import {checkValidation} from '../../models/outputs/report-model';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {VariablesController} from '../../variables/variables-controller';
import {TesterExecutor} from '../../testers/tester-executor';
import {Test} from '../../testers/test';

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
            Logger.debug(`Instantiating requisition publisher from '${this.publisherOriginalAttributes.type}'`);
            this.publisher = Container.subclassesOf(Publisher).create(this.publisherOriginalAttributes);
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
                const message = `Publisher is undefined after prePublish function execution ' ` +
                                    `${JSON.stringify(this.publisherOriginalAttributes, null, 2)}'`;
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
        if (!this.publisher || !this.publisher.onMessageReceived || !this.publisher.messageReceived) {
            return;
        }
        Logger.trace(`Publisher received message: ${this.publisher.messageReceived.substr(0, 100)}`);

        const testExecutor = new TesterExecutor(this.publisher.onMessageReceived);
        testExecutor.addArgument('publisher', this.publisher);
        testExecutor.addArgument('message', this.publisher.messageReceived);

        const tests = testExecutor.execute();
        tests.map((test: Test) => this.report.tests[test.label] = test.valid);
    }

    private executePrePublishingFunction() {
        if (!this.publisherOriginalAttributes.prePublishing) {
            return;
        }

        Logger.trace(`Executing pre publishing function`);

        const testExecutor = new TesterExecutor(this.publisherOriginalAttributes.prePublishing);
        testExecutor.addArgument('publisher', this.publisherOriginalAttributes);

        const tests = testExecutor.execute();

        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        this.publisherOriginalAttributes = (placeHolderReplacer.replace(this.publisherOriginalAttributes) as any);

        Logger.trace(`Adding prePublishing functions tests to report`);
        tests.map((test: Test) => this.report.tests[test.label] = test.valid);
    }
}