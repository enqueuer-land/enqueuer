import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {OnMessageReceivedMetaFunction} from "../../meta-functions/on-message-received-meta-function";
import {Logger} from "../../loggers/logger";
import {DateController} from "../../dates/date-controller";
import {Container} from "../../injector/injector";
import {SubscriptionModel} from "../../requisitions/model/subscription-model";
import Signals = NodeJS.Signals;

export class SubscriptionHandler {

    private timer: any;
    private subscription: SubscriptionModel;
    private report: any = {};
    private startTime: DateController;
    private onTimeOutCallback: Function = () => {};
    private hasTimedOut: boolean = false;

    constructor(subscriptionAttributes: SubscriptionModel) {
        this.subscription = Container().Subscription.create(subscriptionAttributes);
        this.startTime = new DateController();
    }

    public onTimeout(onTimeOutCallback: Function) {
        this.onTimeOutCallback = onTimeOutCallback;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => {
                    this.report = {
                        ...this.report,
                        connectionTime: new DateController().toString()
                    };
                    this.initializeTimeout();
                    resolve();

                    process.on('SIGINT', this.handleKillSignal);
                    process.on('SIGTERM', this.handleKillSignal);

                })
                .catch((err: any) => reject(err));
        });
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message: any) => {
                    this.executeSubscriptionFunction();
                    if (!this.hasTimedOut) {
                        this.subscription.messageReceived = message;
                        Logger.info("Subscription stop waiting because it has already received its message");
                    }
                    this.cleanUp();
                    resolve();
                })
                .catch((err: any) => {
                    this.subscription.unsubscribe();
                    reject(err);
                });
        });
    }

    public getReport(): any {
        this.cleanUp();
        this.report = {
            ...this.report,
            subscription: this.subscription,
            hasReceivedMessage: this.subscription.messageReceived != null,
            hasTimedOut: this.hasTimedOut
        };
        this.report.valid = this.report.hasReceivedMessage &&
                            this.hasTimedOut &&
                            this.report.functionReport.failingTests.length <= 0;

        return this.report;
    }

    private cleanUp(): void {
        Logger.info(`Unsubscribing subscription ${this.subscription.type}`);
        this.subscription.unsubscribe();
        global.clearTimeout(this.timer);
    }

    private initializeTimeout() {
        if (this.subscription.timeout) {
            this.timer = global.setTimeout(() => {
                Logger.info("Subscription stop waiting because it has timed out");
                this.cleanUp();
                this.hasTimedOut = true;
                this.onTimeOutCallback();
            }, this.subscription.timeout);
        }
    }

    private executeSubscriptionFunction() {
        const onMessageReceivedSubscription = new OnMessageReceivedMetaFunction(this.subscription);
        const functionResponse = new MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        this.report = {
            ...this.report,
            functionReport: functionResponse.report,
            messageReceivedTimestamp: new DateController().toString()
        }
    }

    private handleKillSignal = (signal: Signals): void => {
        Logger.fatal(`Handling kill signal ${signal}`);
        this.cleanUp();
    }


}
