import {Logger} from "../../loggers/logger";
import {DateController} from "../../timers/date-controller";
import Signals = NodeJS.Signals;
import {Subscription} from "../../subscriptions/subscription";
import {Timeout} from "../../timers/timeout";
import {Container} from "conditional-injector";
import {OnMessageReceivedReporter} from "../../meta-functions/on-message-received-reporter";
import * as input from "../../models/inputs/subscription-model";
import * as output from "../../models/outputs/subscription-model";
import {checkValidation} from "../../models/outputs/report-model";

export class SubscriptionReporter {

    private subscription: input.SubscriptionModel;
    private report: output.SubscriptionModel;
    private startTime: DateController;
    private timeOut?: Timeout;
    private hasTimedOut: boolean = false;

    constructor(subscriptionAttributes: input.SubscriptionModel) {
        Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = Container.subclassesOf(Subscription).create(subscriptionAttributes);
        this.startTime = new DateController();
        this.report = {
            name: this.subscription.name,
            type: this.subscription.type,
            tests: {},
            valid: true
        }
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
                    this.report.connectionTime = new DateController().toString()
                    this.report.tests["Able to connect"] = true;
                    resolve();

                    process.on('SIGINT', this.handleKillSignal);
                    process.on('SIGTERM', this.handleKillSignal);

                })
                .catch((err: any) => {
                    Logger.error(`[${this.subscription.name}] is unable to connect: ${err}`);
                    this.report.tests["Able to connect"] = false;
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
                            Logger.info(`[${this.subscription.name}] stop waiting because it has received its message`);
                        }
                        this.cleanUp();
                        resolve(message);
                    }
                })
                .catch((err: any) => {
                    Logger.error(`[${this.subscription.name}] is unable to receive message: ${err}`);
                    this.subscription.unsubscribe();
                    reject(err);
                });
        });
    }

    public getReport(): output.SubscriptionModel {
        const hasReceivedMessage = this.subscription.messageReceived != null;
        this.report.tests["Message received"] = hasReceivedMessage;
        if (hasReceivedMessage)
            this.report.tests["No time out"] = !this.hasTimedOut;

        this.cleanUp();
        this.report.valid = this.report.valid && checkValidation(this.report);
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
        if (!this.subscription.messageReceived || !this.subscription.onMessageReceived)
            return;
        const onMessageReceivedReporter = new OnMessageReceivedReporter(this.subscription.messageReceived, this.subscription.onMessageReceived);
        const functionResponse = onMessageReceivedReporter.execute();
        functionResponse.tests
            .map((test: any) => this.report.tests[test.name] = test.valid);
        this.report.messageReceivedTime = new DateController().toString();
        Logger.debug(`onMessageFunctionReport: ${functionResponse}`);
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
