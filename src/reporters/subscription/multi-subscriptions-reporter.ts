import * as input from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import {SubscriptionReporter} from './subscription-reporter';
import {Logger} from '../../loggers/logger';
import {RequisitionModel} from '../../models/inputs/requisition-model';

export class MultiSubscriptionsReporter {
    private subscriptionReporters: SubscriptionReporter[] = [];
    private onFinishCallback?: Function;

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

    public start(onFinish: Function): void {
        this.onFinishCallback = onFinish;
        this.subscriptionReporters
            .forEach(subscription => subscription.startTimeout(() => {
                if (this.onFinishCallback && this.subscriptionReporters
                    .every(subscription => subscription.hasFinished())) {
                    this.onFinishCallback();
                    this.onFinishCallback = () => {
                    };
                }
            }));
    }

    public async subscribe(): Promise<void[]> {
        Logger.info(`Subscriptions are subscribing`);
        return await Promise.all(this.subscriptionReporters.map(subscription => subscription.subscribe()));
    }

    public async receiveMessage(): Promise<void[]> {
        Logger.info(`Subscriptions are ready to receive message`);
        return await Promise.all(this.subscriptionReporters.map(async subscription => {
            await subscription.receiveMessage();
            if (this.onFinishCallback && this.subscriptionReporters
                .every(subscription => subscription.hasFinished())) {
                this.onFinishCallback();
                this.onFinishCallback = () => {
                };
            }
        }));
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
