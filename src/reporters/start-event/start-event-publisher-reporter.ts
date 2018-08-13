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
import {TesterExecutor} from '../../testers/tester-executor';
import {Store} from '../../testers/store';

@Injectable({predicate: (startEvent: any) => startEvent.publisher != null})
export class StartEventPublisherReporter extends StartEventReporter {
    private publisher: Publisher;
    private report: output.PublisherModel;

    constructor(startEvent: input.PublisherModel) {
        super();
        const startEventPublisher = startEvent.publisher;
        this.report = {
            name: startEventPublisher.name,
            valid: true,
            type: startEventPublisher.type,
            tests: []
        };
        this.publisher = this.executeOnInitFunction(startEventPublisher);
    }

    public start(): Promise<void> {
        Logger.trace(`Firing publication as startEvent`);
        return new Promise((resolve, reject) => {
            this.publisher.publish()
                .then(() => {
                    Logger.trace(`Start event published`);
                    this.report.publishTime = new DateController().toString();
                    this.report.tests.push({name: 'Published', valid: true, description: 'Published successfully'});
                    this.executeOnMessageReceivedFunction();
                    return resolve();
                })
                .catch((err: any) => {
                    Logger.error(err);
                    this.report.tests.push({name: 'Published', valid: false, description: err.toString()});
                    reject(err);
                });
        });
    }

    public getReport(): StartEventModel {
        this.report.valid = this.report.valid && checkValidation(this.report);
        this.pushResponseMessageReceivedTest();
        return {
            publisher: this.report
        };
    }

    private pushResponseMessageReceivedTest() {
        if (this.publisher.onMessageReceived) {
            let responseTest = {
                name: 'Response message received',
                valid: false,
                description: 'No response message was received'
            };
            if (this.publisher.messageReceived) {
                responseTest.valid = true;
                responseTest.description = 'Response message was received';
            }
            this.report.tests.push(responseTest);
        }
    }

    private executeOnMessageReceivedFunction() {
        if (!this.publisher.onMessageReceived || !this.publisher.messageReceived) {
            return;
        }
        Logger.trace(`Publisher received message: ${this.publisher.messageReceived.substr(0, 100)}`);

        const testExecutor = new TesterExecutor(this.publisher.onMessageReceived);
        testExecutor.addArgument('publisher', this.publisher);
        testExecutor.addArgument('message', this.publisher.messageReceived);

        const tests = testExecutor.execute();
        this.report.tests = this.report.tests.concat(tests.map(test => {
            return {name: test.label, valid: test.valid, description: test.description};
        }));
    }

    private executeOnInitFunction(publisher: input.PublisherModel): Publisher {
        Logger.trace(`Executing publisher::onInit function`);
        if (publisher.onInit) {
            const testExecutor = new TesterExecutor(publisher.onInit);
            testExecutor.addArgument('publisher', publisher);

            const tests = testExecutor.execute();

            const placeHolderReplacer = new JsonPlaceholderReplacer();
            placeHolderReplacer
                .addVariableMap(Store.getData());
            publisher = (placeHolderReplacer.replace(publisher) as any);

            Logger.trace(`Adding publisher::onInit functions tests to report`);
            this.report.tests = this.report.tests.concat(tests.map(test => {
                return {name: test.label, valid: test.valid, description: test.description};
            }));
        }

        Logger.debug(`Instantiating publisher from '${publisher.type}'`);
        return Container.subclassesOf(Publisher).create(publisher);
    }
}