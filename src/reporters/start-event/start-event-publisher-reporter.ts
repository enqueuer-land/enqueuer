import {Publisher} from '../../publishers/publisher';
import {StartEventReporter} from './start-event-reporter';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {Container, Injectable} from 'conditional-injector';
import {StartEventModel} from '../../models/outputs/start-event-model';
import {checkValidation} from '../../models/outputs/report-model';
import {EventTestExecutor} from '../../testers/event-test-executor';

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
        this.executeOnInitFunction(startEventPublisher);
        Logger.debug(`Instantiating publisher from '${startEventPublisher.type}'`);
        this.publisher = Container.subclassesOf(Publisher).create(startEventPublisher);
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
        if (this.publisher.onMessageReceived && this.publisher.onMessageReceived.assertions) {
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
        const message = this.publisher.messageReceived;
        if (!this.publisher.onMessageReceived || !message) {
            return;
        }
        Logger.trace(`Publisher received response`);

        const eventTestExecutor = new EventTestExecutor(this.publisher.onMessageReceived);
        eventTestExecutor.addArgument('publisher', this.publisher);
        eventTestExecutor.addArgument('message', message);

        Object.keys(message).filter(key => typeof(message[key]) == 'object').forEach((key) => {
            eventTestExecutor.addArgument(key, message[key]);
        });
        this.executeHookMethod(eventTestExecutor);
    }

    private executeOnInitFunction(publisher: input.PublisherModel) {
        if (publisher.onInit) {
            Logger.info(`Executing publisher::onInit hook function`);
            const eventTestExecutor = new EventTestExecutor(publisher.onInit);
            eventTestExecutor.addArgument('publisher', publisher);

            this.executeHookMethod(eventTestExecutor);
        }
    }

    private executeHookMethod(eventTestExecutor: EventTestExecutor) {
        const tests = eventTestExecutor.execute();
        this.report.tests = this.report.tests.concat(tests.map(test => {
            return {name: test.label, valid: test.valid, description: test.description};
        }));
    }

}