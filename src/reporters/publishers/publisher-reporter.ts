import {Publisher} from '../../publishers/publisher';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import {PublisherModel} from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {checkValidation} from '../../models/outputs/report-model';
import {OnMessageReceivedEventExecutor} from '../../events/on-message-received-event-executor';
import {OnInitEventExecutor} from '../../events/on-init-event-executor';
import {OnFinishEventExecutor} from '../../events/on-finish-event-executor';
import {DynamicModulesManager} from '../../plugins/dynamic-modules-manager';

export class PublisherReporter {
    private readonly report: output.PublisherModel;
    private publisher: Publisher;

    constructor(publisher: input.PublisherModel) {
        this.report = {
            id: publisher.id,
            name: publisher.name,
            ignored: publisher.ignore,
            valid: true,
            type: publisher.type,
            tests: []
        };
        this.executeOnInitFunction(publisher);
        Logger.debug(`Trying to instantiate publisher from '${publisher.type}'`);
        this.publisher = DynamicModulesManager.getInstance().getProtocolManager().createPublisher(publisher);
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.publisher.ignore) {
                Logger.trace(`Ignoring publisher ${this.report.name}`);
                resolve();
            } else {
                Logger.trace(`Publishing ${this.report.name}`);
                this.publisher.publish()
                    .then(() => {
                        Logger.debug(`${this.report.name} published`);
                        this.report.publishTime = new DateController().toString();
                        this.report.tests.push({name: 'Published', valid: true, description: 'Published successfully'});
                        this.executeOnMessageReceivedFunction();
                        resolve();
                    })
                    .catch((err: any) => {
                        Logger.error(`${this.report.name} fail publishing: ${err}`);
                        this.report.tests.push({name: 'Published', valid: false, description: err.toString()});
                        reject(err);
                    });

            }
        });
    }

    public getReport(): PublisherModel {
        this.pushResponseMessageReceivedTest();
        this.report.valid = this.report.valid && checkValidation(this.report);
        return this.report;
    }

    public onFinish(): void {
        if (!this.publisher.ignore) {
            this.report.tests = this.report.tests.concat(new OnFinishEventExecutor('publisher', this.publisher).trigger());
        }
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
        if (!this.publisher.ignore) {
            this.report.tests = this.report.tests.concat(new OnMessageReceivedEventExecutor('publisher', this.publisher).trigger());
        }
    }

    private executeOnInitFunction(publisher: input.PublisherModel) {
        if (!publisher.ignore) {
            this.report.tests = this.report.tests.concat(new OnInitEventExecutor('publisher', publisher).trigger());
        }
    }

}
