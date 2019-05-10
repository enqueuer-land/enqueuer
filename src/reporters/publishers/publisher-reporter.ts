import {Publisher} from '../../publishers/publisher';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import {PublisherModel} from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {OnMessageReceivedEventExecutor} from '../../events/on-message-received-event-executor';
import {OnInitEventExecutor} from '../../events/on-init-event-executor';
import {OnFinishEventExecutor} from '../../events/on-finish-event-executor';
import {DynamicModulesManager} from '../../plugins/dynamic-modules-manager';
import {reportModelIsPassing} from '../../models/outputs/report-model';

export class PublisherReporter {
    private readonly report: output.PublisherModel;
    private readonly publisher: Publisher;
    private readonly startTime: Date;

    constructor(publisher: input.PublisherModel) {
        this.report = {
            id: publisher.id,
            name: publisher.name,
            ignored: publisher.ignore,
            valid: true,
            type: publisher.type,
            tests: []
        };
        this.startTime = new Date();
        this.executeOnInitFunction(publisher);
        Logger.debug(`Trying to instantiate publisher from '${publisher.type}'`);
        this.publisher = DynamicModulesManager.getInstance().getProtocolManager().createPublisher(publisher);
    }

    public async publish(): Promise<void> {
        try {
            if (this.publisher.ignore) {
                Logger.trace(`Ignoring publisher ${this.report.name}`);
            } else {
                Logger.trace(`Publishing ${this.report.name}`);
                await this.publisher.publish();
                Logger.debug(`${this.report.name} published`);
                this.report.publishTime = new DateController().toString();
                this.report.tests.push({name: 'Published', valid: true, description: 'Published successfully'});
                this.executeOnMessageReceivedFunction();
            }
        } catch (err) {
            Logger.error(`${this.report.name} fail publishing: ${err}`);
            this.report.tests.push({name: 'Published', valid: false, description: err.toString()});
            throw err;
        }

    }

    public getReport(): PublisherModel {
        this.pushResponseMessageReceivedTest();
        this.report.valid = this.report.valid && reportModelIsPassing(this.report);
        return this.report;
    }

    public onFinish(): void {
        if (!this.publisher.ignore) {
            const onFinishEventExecutor = new OnFinishEventExecutor('publisher', this.publisher);
            onFinishEventExecutor.addArgument('elapsedTime', new Date().getTime() - this.startTime.getTime());
            this.report.tests = this.report.tests.concat(onFinishEventExecutor.trigger());
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
            const onMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('publisher', this.publisher);
            onMessageReceivedEventExecutor.addArgument('elapsedTime', new Date().getTime() - this.startTime.getTime());
            this.report.tests = this.report.tests.concat(onMessageReceivedEventExecutor.trigger());
        }
    }

    private executeOnInitFunction(publisher: input.PublisherModel) {
        if (!publisher.ignore) {
            this.report.tests = this.report.tests.concat(new OnInitEventExecutor('publisher', publisher).trigger());
        }
    }

}
