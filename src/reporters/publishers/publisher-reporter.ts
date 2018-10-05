import {Publisher} from '../../publishers/publisher';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {Container} from 'conditional-injector';
import {checkValidation} from '../../models/outputs/report-model';
import {OnMessageReceivedEventExecutor} from '../../events/on-message-received-event-executor';
import {OnInitEventExecutor} from '../../events/on-init-event-executor';
import {OnFinishEventExecutor} from '../../events/on-finish-event-executor';
import {PublisherModel} from '../../models/outputs/publisher-model';

export class PublisherReporter {
    private publisher: Publisher;
    private report: output.PublisherModel;

    constructor(publisher: input.PublisherModel) {
        this.report = {
            name: publisher.name,
            valid: true,
            type: publisher.type,
            tests: []
        };
        this.executeOnInitFunction(publisher);
        Logger.debug(`Instantiating publisher from '${publisher.type}'`);
        this.publisher = Container.subclassesOf(Publisher).create(publisher);
    }

    public publish(): Promise<void> {
        Logger.trace(`Publishing ${this.report.name}`);
        return new Promise((resolve, reject) => {
            this.publisher.publish()
                .then(() => {
                    Logger.debug(`${this.report.name} published`);
                    this.report.publishTime = new DateController().toString();
                    this.report.tests.push({name: 'Published', valid: true, description: 'Published successfully'});
                    this.executeOnMessageReceivedFunction();
                    resolve();
                })
                .catch((err: any) => {
                    Logger.error(err);
                    this.report.tests.push({name: 'Published', valid: false, description: err.toString()});
                    reject(err);
                });
        });
    }

    public getReport(): PublisherModel {
        this.pushResponseMessageReceivedTest();
        this.report.valid = this.report.valid && checkValidation(this.report);
        return this.report;
    }

    public onFinish(): void {
        this.report.tests = this.report.tests.concat(new OnFinishEventExecutor('publisher', this.publisher).trigger());
    }

    private pushResponseMessageReceivedTest() {
        this.report.messageReceived = this.publisher.messageReceived;
        const publisherHasAssertions = this.publisher.onMessageReceived &&
                                        this.publisher.onMessageReceived.assertions &&
                                        this.publisher.onMessageReceived.assertions.length > 0;
        if (publisherHasAssertions) {
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
        this.report.tests = this.report.tests.concat(new OnMessageReceivedEventExecutor('publisher', this.publisher).trigger());
    }

    private executeOnInitFunction(publisher: input.PublisherModel) {
        this.report.tests = this.report.tests.concat(new OnInitEventExecutor('publisher', publisher).trigger());
    }

}