import {Logger} from '../../loggers/logger';
import {DateController} from '../../timers/date-controller';
import {Subscription} from '../../subscriptions/subscription';
import {Timeout} from '../../timers/timeout';
import {Container} from 'conditional-injector';
import * as input from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {checkValidation} from '../../models/outputs/report-model';
import {isNullOrUndefined} from 'util';
import {TesterExecutor} from '../../testers/tester-executor';
import Signals = NodeJS.Signals;
import {TestModel} from '../../models/outputs/test-model';

export class SubscriptionReporter {

    private subscription: Subscription;
    private report: output.SubscriptionModel;
    private startTime: DateController;
    private timeOut?: Timeout;
    private hasTimedOut: boolean = false;

    constructor(subscriptionAttributes: input.SubscriptionModel) {
        this.startTime = new DateController();
        this.report = {
            name: subscriptionAttributes.name,
            type: subscriptionAttributes.type,
            tests: [],
            valid: true
        };

        if (subscriptionAttributes.onInit) {
            Logger.info(`Executing subscription::onInit hook function`);
            const testExecutor = new TesterExecutor(subscriptionAttributes.onInit);
            testExecutor.addArgument('subscription', subscriptionAttributes);
            this.executeHookFunction(testExecutor);
        }
        Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = Container.subclassesOf(Subscription).create(subscriptionAttributes);
    }

    public startTimeout(onTimeOutCallback: Function) {
        this.subscription.messageReceived = undefined;
        if (this.timeOut) {
            this.timeOut.clear();
        }
        this.timeOut = new Timeout(() => {
            if (!this.subscription.messageReceived) {
                const message = `[${this.subscription.name}] stopped waiting because it has timed out`;
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
                    this.report.connectionTime = new DateController().toString();
                    resolve();

                    process.on('SIGINT', this.handleKillSignal);
                    process.on('SIGTERM', this.handleKillSignal);

                })
                .catch((err: any) => {
                    Logger.error(`[${this.subscription.name}] is unable to connect: ${err}`);
                    reject(err);
                });
        });
    }

    public receiveMessage(): Promise<any> {
        this.initializeTimeout();
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message: any) => {
                    Logger.debug(`[${this.subscription.name}] received its message`);
                    if (!isNullOrUndefined(message)) {
                        this.handleMessageArrival(message);
                        resolve(message);
                    } else {
                        Logger.warning(`[${this.subscription.name}] message is null or undefined`);
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
        this.addMessageReceivedReport();
        this.addTimeoutReport();

        this.cleanUp();
        this.report.valid = this.report.valid && checkValidation(this.report);
        return this.report;
    }

    private handleMessageArrival(message: any) {
        Logger.debug(`${this.subscription.name} message: ${JSON.stringify(message)}`.substr(0, 100) + '...');

        if (!this.hasTimedOut) {
            Logger.info(`${this.subscription.name} stop waiting because it has received its message`);
            this.subscription.messageReceived = message;
            this.executeOnMessageReceivedFunction();
            if (this.subscription.response) {
                Logger.debug(`Subscription ${this.subscription.type} sending synchronous response`);
                this.subscription.sendResponse();
            }
        } else {
            Logger.info(`${this.subscription.name} has received message in a unable time`);
        }
        this.cleanUp();
    }

    private addMessageReceivedReport() {
        const messageReceivedTestLabel = 'Message received';
        if (this.subscription.messageReceived != null) {
            this.report.tests.push({
                valid: true,
                name: messageReceivedTestLabel,
                description: `Subscription has received its message successfully`
            });
        } else {
            this.report.tests.push({
                valid: false,
                name: messageReceivedTestLabel,
                description: `Subscription has not received its message in a valid time`
            });
        }
    }

    private addTimeoutReport() {
        if (this.subscription.timeout) {
            const timeoutTest: TestModel = {
                valid: false,
                name: 'No time out',
                description: `Subscription has timed out`
            };
            if (!this.hasTimedOut) {
                timeoutTest.valid = true;
                timeoutTest.description = 'Subscription has not timed out';
            }
            this.report.tests.push(timeoutTest);
        }
    }

    private cleanUp(): void {
        this.cleanUp = () => {
            //do nothing
        };
        Logger.info(`Unsubscribing subscription ${this.subscription.type}`);
        try {
            this.subscription.unsubscribe();
        } catch (err) {
            Logger.error(err);
        }
        if (this.timeOut) {
            this.timeOut.clear();
        }
    }

    private initializeTimeout() {
        if (this.timeOut && this.subscription.timeout) {
            Logger.debug(`[${this.subscription.name}] setting timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }

    private executeOnMessageReceivedFunction() {
        if (!this.subscription.messageReceived || !this.subscription.onMessageReceived) {
            Logger.trace(`[${this.subscription.name}] has no onMessageReceived to be executed`);
            return;
        }
        Logger.trace(`[${this.subscription.name}] executing onMessageReceived`);

        const testExecutor = new TesterExecutor(this.subscription.onMessageReceived);
        testExecutor.addArgument('subscription', this.subscription);
        testExecutor.addArgument('message', this.subscription.messageReceived);
        this.executeHookFunction(testExecutor);

        this.report.messageReceivedTime = new DateController().toString();
    }

    private executeHookFunction(testExecutor: TesterExecutor) {
        const tests = testExecutor.execute();
        this.report.tests = tests.map(test => {
                                                    return {name: test.label, valid: test.valid, description: test.description};
                                                })
                                .concat(this.report.tests);
    }

    private handleKillSignal = (signal: Signals): void => {
        Logger.fatal(`Handling kill signal ${signal}`);
        this.cleanUp();
        new Timeout(() => {
            Logger.fatal('Adios muchachos');
            process.exit(1);
        }).start(2000);
    }

}
