import * as input from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {SubscriptionReporter} from './subscription-reporter';
import {Logger} from '../../loggers/logger';

export class MultiSubscriptionsReporter {
    private subscriptionReporters: SubscriptionReporter[] = [];
    private subscriptionsStoppedWaitingCounter: number = 0;

    constructor(subscriptionsAttributes: input.SubscriptionModel[]) {
        if (subscriptionsAttributes) {
            this.subscriptionReporters = subscriptionsAttributes.map((subscription, index) => {
                if (!subscription.name) {
                    subscription.name = `Subscription #${index}`;
                }
                return new SubscriptionReporter(subscription);
            });
        }
    }

    public subscribe(stoppedWaitingCallback: Function): Promise<{}[]> {
        return Promise.all(this.subscriptionReporters.map(
            subscription => this.promisifySubscription(subscription, stoppedWaitingCallback)
                    ));
    }

    private promisifySubscription(subscription: SubscriptionReporter, stoppedWaitingCallback: Function) {
        return new Promise((resolve, reject) => {
            subscription.startTimeout(() => {
                if (this.haveAllSubscriptionsStoppedWaiting()) {
                    Logger.debug(`All pre-subscribed subscriptions stopped waiting`);
                    reject(`Subscription has timed out`);
                    stoppedWaitingCallback();
                }
            });
            subscription
                .subscribe()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.subscriptionReporters.length <= 0) {
                return resolve();
            }
            this.subscriptionReporters.forEach(subscriptionHandler => {
                subscriptionHandler.receiveMessage()
                    .then(() => {
                        if (this.haveAllSubscriptionsStoppedWaiting()) {
                            Logger.debug(`All up-to-receive subscriptions stopped waiting`);
                            resolve();
                        }
                    })
                    .catch(err => reject(err));
            });
        });
    }

    public async unsubscribe(): Promise<void[]> {
        return await Promise.all(this.subscriptionReporters.map(subscription => subscription.unsubscribe()));
    }

    public getReport(): output.SubscriptionModel[] {
        return this.subscriptionReporters.map(subscription => subscription.getReport());
    }

    public onFinish(): void {
        this.subscriptionReporters.forEach(subscriptionHandler => subscriptionHandler.onFinish());
    }

    private haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        Logger.debug(`Subscription stopped waiting ${this.subscriptionsStoppedWaitingCounter}/${this.subscriptionReporters.length}`);
        return this.subscriptionsStoppedWaitingCounter >= this.subscriptionReporters.length;
    }

}
