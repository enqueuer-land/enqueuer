import {Logger} from '../../loggers/logger';
import {DateController} from '../../timers/date-controller';
import {Subscription} from '../../subscriptions/subscription';
import {Timeout} from '../../timers/timeout';
import {Container} from 'conditional-injector';
import * as input from '../../models/inputs/subscription-model';
import {SubscriptionModel} from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {checkValidation} from '../../models/outputs/report-model';
import {OnInitEventExecutor} from '../../events/on-init-event-executor';
import {OnMessageReceivedEventExecutor} from '../../events/on-message-received-event-executor';
import {SubscriptionFinalReporter} from './subscription-final-reporter';
import Signals = NodeJS.Signals;
import {OnFinishEventExecutor} from '../../events/on-finish-event-executor';
import SignalsListener = NodeJS.SignalsListener;

export class SubscriptionReporter {

    private killListener: SignalsListener;
    private subscription: Subscription;
    private report: output.SubscriptionModel;
    private startTime: DateController;
    private timeOut?: Timeout;
    private hasTimedOut: boolean = false;
    private subscribed: boolean = false;

    constructor(subscriptionAttributes: input.SubscriptionModel) {
        this.startTime = new DateController();
        this.report = {
            name: subscriptionAttributes.name,
            type: subscriptionAttributes.type,
            tests: [],
            valid: true
        };

        this.executeOnInitFunction(subscriptionAttributes);
        Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = Container.subclassesOf(Subscription).create(subscriptionAttributes);
        this.killListener = (signal: Signals) => this.handleKillSignal(signal, this.subscription.type || 'undefined');
    }

    public startTimeout(onTimeOutCallback: Function) {
        this.subscription.messageReceived = undefined;
        if (this.timeOut) {
            this.timeOut.clear();
        }
        this.timeOut = new Timeout(() => {
            if (!this.subscription.messageReceived) {
                const message = `${this.subscription.name} stopped waiting because it has timed out`;
                Logger.info(message);
                this.hasTimedOut = true;
                onTimeOutCallback();
            }
        });
    }

    public subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.trace(`Starting ${this.subscription.name} timer`);
            this.initializeTimeout();
            Logger.trace(`Subscription ${this.subscription.name} is subscribing`);
            this.subscription.subscribe()
                .then(() => {
                    if (this.hasTimedOut) {
                        const message = `Ignoring subscription ${this.subscription.name} because it has timed out`;
                        Logger.error(message);
                        reject(message);
                    } else {
                        this.report.connectionTime = new DateController().toString();
                        this.subscribed = true;
                        resolve();
                    }

                    process.once('SIGINT', this.killListener)
                            .once('SIGTERM', this.killListener);

                })
                .catch((err: any) => {
                    Logger.error(`${this.subscription.name} is unable to connect: ${err}`);
                    reject(err);
                });
        });
    }

    public receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message: any) => {
                    // if (this.timeOut) {
                    //     this.timeOut.clear();
                    // }

                    Logger.debug(`${this.subscription.name} received its message`);
                    if (message !== null || message !== undefined) {
                        this.handleMessageArrival(message);
                        this.sendSyncResponse(resolve, message, reject);
                    } else {
                        Logger.warning(`${this.subscription.name} message is null or undefined`);
                    }
                })
                .catch((err: any) => {
                    this.subscription.unsubscribe().catch(console.log.bind(console));
                    Logger.error(`${this.subscription.name} is unable to receive message: ${err}`);
                    reject(err);
                });
        });
    }

    private sendSyncResponse(resolve: any, message: any, reject: any) {
        if (this.subscription.response) {
            Logger.debug(`Subscription ${this.subscription.type} sending synchronous response`);
            this.subscription.sendResponse()
                .then(() => resolve(message))
                .catch(err => {
                    Logger.warning(`Error ${this.subscription.type} synchronous response sending: ${err}`);
                    reject(err);
                });
        } else {
            resolve();
        }
    }

    public getReport(): output.SubscriptionModel {
        const finalReporter = new SubscriptionFinalReporter(this.subscribed,
            this.subscription.avoid,
            !!this.subscription.messageReceived,
            !!this.subscription.timeout && this.hasTimedOut);
        this.report.tests = this.report.tests.concat(finalReporter.getReport());

        this.report.messageReceived = this.subscription.messageReceived;
        this.report.valid = this.report.valid && checkValidation(this.report);
        return this.report;
    }

    public async unsubscribe(): Promise<void> {
        process.removeListener('SIGINT', this.killListener)
                .removeListener('SIGTERM', this.killListener);

        Logger.debug(`Unsubscribing subscription ${this.subscription.type}`);
        if (this.subscribed) {
            return this.subscription.unsubscribe();
        }
    }

    public onFinish() {
        Logger.trace(`Executing subscription onFinish`);
        this.report.tests = this.report.tests.concat(new OnFinishEventExecutor('subscription', this.subscription).trigger());
    }

    private handleMessageArrival(message: any) {
        Logger.debug(`${this.subscription.name} message: ${JSON.stringify(message)}`.substr(0, 150) + '...');
        if (!this.hasTimedOut) {
            Logger.debug(`${this.subscription.name} stop waiting because it has received its message`);
            this.subscription.messageReceived = message;
            this.executeOnMessageReceivedFunction();
        } else {
            Logger.info(`${this.subscription.name} has received message in a unable time`);
        }
        Logger.debug(`${this.subscription.name} handled message arrival`);
    }

    private initializeTimeout() {
        if (this.timeOut && this.subscription.timeout) {
            Logger.debug(`${this.subscription.name} setting timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }

    private executeOnInitFunction(subscriptionAttributes: SubscriptionModel) {
        Logger.debug(`Executing subscription::onInit hook function`);
        this.report.tests = this.report.tests.concat(new OnInitEventExecutor('subscription', subscriptionAttributes).trigger());
    }

    private executeOnMessageReceivedFunction() {
        Logger.trace(`Executing subscription onMessageReceivedResponse`);
        Logger.trace(`${this.subscription.name} executing hook ${this.subscription.type} specific`);
        this.report.tests = this.subscription.onMessageReceivedTests().concat(this.report.tests);
        this.report.tests = this.report.tests.concat(new OnMessageReceivedEventExecutor('subscription', this.subscription).trigger());
    }

    private async handleKillSignal(signal: Signals, type: string): Promise<void> {
        Logger.fatal(`Subscription reporter '${type}' handling kill signal ${signal}`);
        await this.unsubscribe();
        Logger.fatal(`Subscription reporter '${type}' unsubscribed`);
    }

}
