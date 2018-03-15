import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {OnMessageReceivedMetaFunction} from "../../meta-functions/on-message-received-meta-function";
import {Logger} from "../../loggers/logger";
import {DateController} from "../../dates/date-controller";
import {SubscriptionModel} from "../../requisitions/models/subscription-model";
import Signals = NodeJS.Signals;
import {Container} from "../../injector/container";
import {Subscription} from "../../subscriptions/subscription";
import {Report} from "../../reporters/report";
import {Timeout} from "../../timeouts/timeout";

export class SubscriptionHandler {

    private subscription: SubscriptionModel;
    private report: any = {};
    private startTime: DateController;
    private timeOut?: Timeout;
    private hasTimedOut: boolean = false;

    constructor(subscriptionAttributes: SubscriptionModel) {
        this.subscription = Container.get(Subscription).createFromPredicate(subscriptionAttributes);
        this.startTime = new DateController();
    }

    public onTimeout(onTimeOutCallback: Function) {
        this.timeOut = new Timeout(() => {
            Logger.info("Subscription stop waiting because it has timed out");
            this.cleanUp();
            this.hasTimedOut = true;
            onTimeOutCallback();
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => {
                    this.report = {
                        ...this.report,
                        connectionTime: new DateController().toString()
                    };
                    resolve();

                    process.on('SIGINT', this.handleKillSignal);
                    process.on('SIGTERM', this.handleKillSignal);

                })
                .catch((err: any) => reject(err));
        });
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.initializeTimeout();

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

    public getReport(): Report {
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
        if (this.timeOut)
            this.timeOut.clear();
    }

    private initializeTimeout() {
        if (this.timeOut && this.subscription.timeout) {
            this.timeOut.start(this.subscription.timeout);
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
        new Timeout(() => {
            Logger.fatal("Adios muchachos");
            process.exit(1);
        }).start(2000);
    }

}
