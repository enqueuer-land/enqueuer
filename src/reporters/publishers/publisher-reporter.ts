import {Publisher} from '../../publishers/publisher';
import {DateController} from '../../timers/date-controller';
import * as output from '../../models/outputs/publisher-model';
import {PublisherModel} from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';
import {DynamicModulesManager} from '../../plugins/dynamic-modules-manager';
import {EventExecutor} from '../../events/event-executor';
import {DefaultHookEvents} from '../../models/events/event';
import {ObjectDecycler} from '../../object-parser/object-decycler';
import {TestModel, testModelIsPassing} from '../../models/outputs/test-model';
import {NotificationEmitter} from '../../notifications/notification-emitter';
import {HookModel} from '../../models/outputs/hook-model';
import {Notifications} from '../../notifications/notifications';

export class PublisherReporter {
    private readonly report: output.PublisherModel;
    private readonly publisher: Publisher;
    private readonly startTime: Date;
    private readonly executedHooks: { [propName: string]: string[] };
    private published: boolean = false;

    constructor(publisher: input.PublisherModel) {
        this.report = {
            id: publisher.id,
            name: publisher.name,
            ignored: publisher.ignore,
            valid: true,
            hooks: {
                [DefaultHookEvents.ON_INIT]: {valid: true, tests: []},
                [DefaultHookEvents.ON_FINISH]: {valid: true, tests: []}
            },
            type: publisher.type
        };
        this.executedHooks = {};
        this.startTime = new Date();
        this.executeOnInitFunction(publisher);
        Logger.debug(`Trying to instantiate publisher from '${publisher.type}'`);
        this.publisher = DynamicModulesManager.getInstance().getProtocolManager().createPublisher(publisher);
        this.publisher.registerHookEventExecutor((eventName: string, args: any) => this.executeHookEvent(eventName, args));
    }

    public async publish(): Promise<void> {
        try {
            if (this.publisher.ignore) {
                Logger.trace(`Ignoring publisher ${this.report.name}`);
            } else {
                Logger.trace(`Publishing ${this.report.name}`);
                const response = await this.publisher.publish();
                Logger.debug(`${this.report.name} published`);
                this.report.publishTime = new DateController().toString();
                this.published = true;
                this.report.hooks![DefaultHookEvents.ON_FINISH].tests.push({
                    name: 'Published', valid: this.published, description: this.processMessage(response), implicit: true
                });

            }
        } catch (err) {
            Logger.error(`'${this.report.name}' fail publishing: ${err}`);
            this.report.hooks![DefaultHookEvents.ON_FINISH].tests.push({
                name: 'Published', valid: false, description: err.toString(), implicit: true
            });
            this.report.valid = false;
            throw err;
        }
    }

    private processMessage(messageReceived: any): string {
        if (messageReceived) {
            if (typeof messageReceived === 'object') {
                return JSON.stringify(new ObjectDecycler().decycle(messageReceived), null, 2);
            }
            return messageReceived;
        }
        return 'Published successfully';
    }

    public getReport(): PublisherModel {
        return this.report;
    }

    public onFinish(): void {
        if (!this.publisher.ignore) {
            this.executeHookEvent(DefaultHookEvents.ON_FINISH, {executedHooks: this.executedHooks});
            this.report.valid = this.report.valid && this.published;
            NotificationEmitter.emit(Notifications.PUBLISHER_FINISHED, {publisher: this.report});
        }
    }

    private executeHookEvent(eventName: string, args: any = {}, publisher: any = this.publisher): void {
        if (!publisher.ignore) {
            this.executedHooks[eventName] = Object.keys(args);
            args.elapsedTime = new Date().getTime() - this.startTime.getTime();
            const eventExecutor = new EventExecutor(publisher, eventName, 'publisher');
            Object.keys(args).forEach((key: string) => {
                eventExecutor.addArgument(key, args[key]);
            });
            const previousHook = this.report.hooks![eventName];
            let previousTests: TestModel[] = [];
            if (previousHook && previousHook.tests) {
                previousTests = previousHook.tests || [];
            }
            const tests = previousTests.concat(eventExecutor.execute());
            const valid = tests.every((test: TestModel) => testModelIsPassing(test));
            const hookResult: HookModel = {
                arguments: new ObjectDecycler().decycle(args),
                tests: tests,
                valid: valid
            };
            this.report.hooks![eventName] = hookResult;
            NotificationEmitter.emit(Notifications.HOOK_FINISHED, {
                hookName: eventName,
                hook: hookResult,
                publisher: this.publisher
            });

            this.report.valid = this.report.valid && valid;
        }
    }

    private executeOnInitFunction(publisher: input.PublisherModel) {
        if (!publisher.ignore) {
            NotificationEmitter.emit(Notifications.PUBLISHER_STARTED, {publisher: publisher});
            this.executeHookEvent(DefaultHookEvents.ON_INIT, {}, publisher);
        }
    }

}
