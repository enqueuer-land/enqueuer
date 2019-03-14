import * as input from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {SubscriptionReporter} from './subscription-reporter';
import {Logger} from '../../loggers/logger';

export class MultiSubscriptionsReporter {
    private subscriptionReporters: SubscriptionReporter[] = [];
    private timeoutPromise: Promise<any>;

    constructor(subscriptionsAttributes: input.SubscriptionModel[]) {
        Logger.debug(`Instantiating subscriptions`);
        this.subscriptionReporters = subscriptionsAttributes.map((subscription) => new SubscriptionReporter(subscription));
        this.timeoutPromise = Promise.resolve();
    }

    public start(): void {
        this.timeoutPromise = new Promise((resolve) => {
            this.subscriptionReporters.forEach(subscription => {
                subscription.startTimeout(() => {
                    if (this.subscriptionReporters.every(subscription => subscription.hasFinished())) {
                        const message = `Every subscription has finished its job`;
                        Logger.debug(message);
                        resolve(message);
                    }
                });
            });
        });
    }

    public async subscribe(): Promise<any> {
        Logger.info(`Subscriptions are subscribing`);
        return Promise.race([
            Promise.all(this.subscriptionReporters.map(async subscription => {
                try {
                    await subscription.subscribe();
                } catch (err) {
                    Logger.error(`Error subscribing: ${err}`);
                }
            })),
            this.timeoutPromise]);

    }

    public async receiveMessage(): Promise<number> {
        let errorsCounter = 0;
        Logger.info(`Subscriptions are waiting for message`);
        await Promise.race([
            Promise.all(this.subscriptionReporters.map(async subscription => {
                try {
                    await subscription.receiveMessage();
                    Logger.debug(`A subscription received a message`);
                } catch (err) {
                    ++errorsCounter;
                    Logger.error(`Error receiving message: ${err}`);
                }
            })),
            this.timeoutPromise]);

        Logger.debug(`Subscriptions are no longer waiting for messages`);
        return errorsCounter;
    }

    public async unsubscribe(): Promise<void[]> {
        Logger.info(`Subscriptions are unsubscribing`);
        return await Promise.all(this.subscriptionReporters.map(subscription => subscription.unsubscribe()));
    }

    public getReport(): output.SubscriptionModel[] {
        return this.subscriptionReporters.map(subscription => subscription.getReport());
    }

    public onFinish(): void {
        this.subscriptionReporters.forEach(subscriptionHandler => subscriptionHandler.onFinish());
    }

}
