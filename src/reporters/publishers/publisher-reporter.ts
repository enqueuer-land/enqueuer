import {Publisher} from '../../publishers/publisher';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import {PublisherModel} from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {DynamicModulesManager} from '../../plugins/dynamic-modules-manager';
import {reportModelIsPassing} from '../../models/outputs/report-model';
import {EventExecutor} from '../../events/event-executor';
import {DefaulHookEvents} from '../../models/events/event';

export class PublisherReporter {
    private readonly report: output.PublisherModel;
    private readonly publisher: Publisher;
    private readonly startTime: Date;
    private messageReceived: any;

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
                this.messageReceived = await this.publisher.publish();
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
            this.executeHookEvent(DefaulHookEvents.ON_FINISH, {elapsedTime: new Date().getTime() - this.startTime.getTime()});
        }
    }

    protected executeHookEvent(eventName: string, args: any): void {
        if (!this.publisher.ignore) {
            const eventExecutor = new EventExecutor(this.publisher, eventName, 'publisher');
            Object.keys(args).forEach((key: string) => {
                eventExecutor.addArgument(key, args[key]);
            });
            this.report.tests = this.report.tests.concat(eventExecutor.execute());
        }
    }

    private pushResponseMessageReceivedTest() {
        this.report.messageReceived = this.messageReceived || this.publisher.messageReceived;
        const publisherHasAssertions = this.publisher.onMessageReceived &&
            this.publisher.onMessageReceived.assertions &&
            this.publisher.onMessageReceived.assertions.length > 0;
        if (publisherHasAssertions) {
            let responseTest = {
                name: 'Response message received',
                valid: false,
                description: 'No response message was received'
            };
            if (this.report.messageReceived) {
                responseTest.valid = true;
                responseTest.description = 'Response message was received';
            }
            this.report.tests.push(responseTest);
        }
    }

    private executeOnMessageReceivedFunction() {
        if (!this.publisher.ignore) {
            const message = this.messageReceived || this.publisher.messageReceived;
            const args: any = {
                elapsedTime: new Date().getTime() - this.startTime.getTime(),
                message
            };

            if (typeof (message) == 'object' && !Buffer.isBuffer(message)) {
                Object.keys(message).forEach((key) => args[key] = message[key]);
            }
            this.executeHookEvent(DefaulHookEvents.ON_MESSAGE_RECEIVED, args);
        }
    }

    private executeOnInitFunction(publisher: input.PublisherModel) {
        if (!publisher.ignore) {
            this.report.tests = this.report.tests.concat(new EventExecutor(publisher, DefaulHookEvents.ON_INIT, 'publisher').execute());
        }
    }

}
