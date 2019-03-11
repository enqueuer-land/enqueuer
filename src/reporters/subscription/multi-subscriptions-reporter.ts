import * as input from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {SubscriptionReporter} from './subscription-reporter';
import {Logger} from '../../loggers/logger';
import {RequisitionModel} from '../../models/inputs/requisition-model';

export class MultiSubscriptionsReporter {
    private subscriptionReporters: SubscriptionReporter[] = [];
    private subscriptionsStoppedWaitingCounter: number = 0;

    constructor(subscriptionsAttributes: input.SubscriptionModel[], parent: RequisitionModel) {
        if (subscriptionsAttributes) {
            this.subscriptionReporters = subscriptionsAttributes.map((subscription, index) => {
                if (!subscription.name) {
                    subscription.name = `Subscription #${index}`;
                }
                subscription.parent = parent;
                return new SubscriptionReporter(subscription);
            });
        }
    }

    public async subscribe(stoppedWaitingCallback: Function): Promise<void> {
        Logger.info(`Subscriptions are subscribing`);
        await Promise
            .all(this.subscriptionReporters
                .map(async subscription => {
                    let returned = false;
                    subscription.startTimeout(() => {
                        if (this.haveAllSubscriptionsStoppedWaiting()) {
                            Logger.debug(`All pre-subscribed subscriptions stopped waiting`);
                            stoppedWaitingCallback();
                            if (!returned) {
                                throw `Subscription has timed out`;
                            }
                        }
                    });
                    returned = true;
                    return await subscription.subscribe();
                }));
    }

    public receiveMessage(): Promise<void> {
        Logger.info(`Subscriptions are ready to receive message`);
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
