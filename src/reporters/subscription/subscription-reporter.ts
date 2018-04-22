import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {OnMessageReceivedMetaFunction} from "../../meta-functions/on-message-received-meta-function";
import {Logger} from "../../loggers/logger";
import {DateController} from "../../timers/date-controller";
import {SubscriptionModel} from "../../models/subscription-model";
import Signals = NodeJS.Signals;
import {Subscription} from "../../subscriptions/subscription";
import {Report} from "../../reports/report";
import {Timeout} from "../../timers/timeout";
import {Reporter} from "../reporter";
import {Container} from "conditional-injector";

export class SubscriptionReporter implements Reporter {

    private subscription: Subscription;
    private report: Report;
    private startTime: DateController;
    private timeOut?: Timeout;
    private hasTimedOut: boolean = false;

    constructor(subscriptionAttributes: SubscriptionModel) {
        Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = Container.subclassesOf(Subscription).create(subscriptionAttributes);
        this.startTime = new DateController();
        this.report = {
            valid: false,
            name: this.subscription.name,
            errorsDescription: []
        };
    }

    public startTimeout(onTimeOutCallback: Function) {
        this.subscription.messageReceived = undefined;
        if (this.timeOut)
            this.timeOut.clear();
        this.timeOut = new Timeout(() => {
            if (!this.subscription.messageReceived) {
                const message = `[${this.subscription.name}] stop waiting because it has timed out`;
                Logger.info(message);
                this.hasTimedOut = true;
                if (this.report.errorsDescription)
                    this.report.errorsDescription.push("Timeout");
                onTimeOutCallback();
            }
            this.cleanUp();
        });
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            Logger.trace(`[${this.subscription.name}] is connecting`);
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
                .catch((err: any) => {
                    Logger.error(`[${this.subscription.name}] is unable to connect: ${err}`);
                    if (this.report.errorsDescription)
                        this.report.errorsDescription.push("Unable to connect")
                    reject(err);
                });
        });
    }

    public receiveMessage(): Promise<string> {
        this.initializeTimeout();
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message: any) => {
                    if (message) {
                        Logger.debug(`[${this.subscription.name}] received its message: ${JSON.stringify(message)}`.substr(0, 100) + "...");

                        if (!this.hasTimedOut) {
                            this.subscription.messageReceived = message;
                            this.executeSubscriptionFunction();
                            Logger.info(`[${this.subscription.name}] stop waiting because it has already received its message`);
                        }
                        this.cleanUp();
                        resolve(message);
                    }
                })
                .catch((err: any) => {
                    Logger.error(`[${this.subscription.name}] is unable to receive message: ${err}`);
                    if (this.report.errorsDescription)
                        this.report.errorsDescription.push("Unable to receive message")
                    this.subscription.unsubscribe();
                    reject(err);
                });
        });
    }

    public getReport(): Report {
        this.report = {
            ...this.report,
            name: this.subscription.name,
            type: this.subscription.type,
            hasReceivedMessage: this.subscription.messageReceived != null,
            hasTimedOut: this.hasTimedOut
        };
        const hasReceivedMessage = this.report.hasReceivedMessage;
        if (!hasReceivedMessage)
            if (this.report.errorsDescription)
                this.report.errorsDescription.push(`No message received`);

        if (this.subscription.name)
            this.report.name = this.subscription.name;

        this.report.valid = hasReceivedMessage &&
                            !this.hasTimedOut &&
                            this.report.onMessageFunctionReport.failingTests &&
                            this.report.onMessageFunctionReport.failingTests.length <= 0;
        this.cleanUp();
        return this.report;
    }

    private cleanUp(): void {
        this.cleanUp = () => {};
        Logger.info(`Unsubscribing subscription ${this.subscription.type}`);
        try {
            this.subscription.unsubscribe();
        } catch (err) {
            Logger.error(err);
        }
        if (this.timeOut)
            this.timeOut.clear();
    }

    private initializeTimeout() {
        if (this.timeOut && this.subscription.timeout) {
            Logger.debug(`[${this.subscription.name}] setting timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }

    private executeSubscriptionFunction() {
        const onMessageReceivedSubscription = new OnMessageReceivedMetaFunction(this.subscription);
        let functionResponse = new MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        Logger.trace(`Response of subscription onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        if (this.report.errorsDescription)
            this.report.errorsDescription = this.report.errorsDescription.concat(functionResponse.failingTests);
        if (functionResponse.exception) {
            if (this.report.errorsDescription)
                this.report.errorsDescription.push(functionResponse.exception);
        }

        this.report = {
            ...this.report,
            onMessageFunctionReport: functionResponse,
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
