import * as input from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {SubscriptionReporter} from './subscription-reporter';
import {Logger} from '../../loggers/logger';
import {ComponentImporter} from '../../requisition-runners/component-importer';

export class MultiSubscriptionsReporter {
    private subscriptions: SubscriptionReporter[] = [];
    private timeoutPromise: Promise<any>;

    constructor(subscriptions: input.SubscriptionModel[]) {
        Logger.debug(`Instantiating subscriptions`);
        this.subscriptions = subscriptions
            .map(subscription => new SubscriptionReporter(new ComponentImporter().importSubscription(subscription)));
        this.timeoutPromise = Promise.resolve();
    }

    public start(): void {
        this.timeoutPromise = new Promise((resolve) => {
            this.subscriptions.forEach(subscription => {
                subscription.startTimeout(() => {
                    if (this.subscriptions.every(subscription => subscription.hasFinished())) {
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
            Promise.all(this.subscriptions.map(async subscription => {
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
            Promise.all(this.subscriptions.map(async subscription => {
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
        return await Promise.all(this.subscriptions.map(subscription => subscription.unsubscribe()));
    }

    public getReport(): output.SubscriptionModel[] {
        return this.subscriptions.map(subscription => subscription.getReport());
    }

    public onFinish(): void {
        this.subscriptions.forEach(subscriptionHandler => subscriptionHandler.onFinish());
    }

}
