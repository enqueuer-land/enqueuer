import {MetaFunctionExecutor} from "../../meta-functions/meta-function-executor";
import {OnMessageReceivedMetaFunctionBody} from "../../meta-functions/on-message-received-meta-function-body";
import {Logger} from "../../loggers/logger";
import {DateController} from "../../timers/date-controller";
import {SubscriptionModel} from "../../models/subscription-model";
import Signals = NodeJS.Signals;
import {Subscription} from "../../subscriptions/subscription";
import {Report, Test} from "../../reports/report";
import {Timeout} from "../../timers/timeout";
import {Reporter} from "../reporter";
import {Container} from "conditional-injector";
import {ReportCompositor} from "../../reports/report-compositor";
import {OnMessageReceivedReporter} from "../../meta-functions/on-message-received-reporter";

export class SubscriptionReporter implements Reporter {

    private subscription: Subscription;
    private reportCompositor: ReportCompositor;
    private startTime: DateController;
    private timeOut?: Timeout;
    private hasTimedOut: boolean = false;

    constructor(subscriptionAttributes: SubscriptionModel) {
        Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = Container.subclassesOf(Subscription).create(subscriptionAttributes);
        this.startTime = new DateController();
        this.reportCompositor = new ReportCompositor(this.subscription.name);
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
                    this.reportCompositor.addInfo({
                        connectionTime: new DateController().toString()
                    })
                    resolve();

                    process.on('SIGINT', this.handleKillSignal);
                    process.on('SIGTERM', this.handleKillSignal);

                })
                .catch((err: any) => {
                    Logger.error(`[${this.subscription.name}] is unable to connect: ${err}`);
                    this.reportCompositor.addTest("Unable to connect", false);
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
                    this.reportCompositor.addTest("Unable to receive message", false)
                    this.subscription.unsubscribe();
                    reject(err);
                });
        });
    }

    public getReport(): Report {
        const hasReceivedMessage = this.subscription.messageReceived != null;
        this.reportCompositor.addTest("Message received", hasReceivedMessage);
        if (hasReceivedMessage)
            this.reportCompositor.addTest("No time out", !this.hasTimedOut);
        this.reportCompositor.addInfo({
            type: this.subscription.type,
            hasReceivedMessage: hasReceivedMessage,
            hasTimedOut: this.hasTimedOut
        });
        this.cleanUp();
        return this.reportCompositor.snapshot();
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
            .map((passing: Test) => this.reportCompositor.addTest(passing.name, passing.valid));
        this.reportCompositor.addInfo({
            onMessageFunctionReport: functionResponse,
            messageReceivedTime: new DateController().toString()
        });
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
