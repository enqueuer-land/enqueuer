import {SubscriptionModel} from "../../requisitions/models/subscription-model";
import {Report} from "../report";
import {Reporter} from "../reporter";
import {SubscriptionReporter} from "./subscription-reporter";

export class MultiSubscriptionsReporter implements Reporter{
    private subscriptionHandlers: SubscriptionReporter[] = [];
    private subscriptionsConnectionCompletedCounter: number = 0;
    private subscriptionsStoppedWaitingCounter: number = 0;

    constructor(subscriptionsAttributes: SubscriptionModel[]) {
        for (let id: number = 0; id < subscriptionsAttributes.length; ++id) {
            this.subscriptionHandlers.push(new SubscriptionReporter(subscriptionsAttributes[id]));
        }
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandlers.forEach(subscriptionHandler => {
                subscriptionHandler.connect()
                    .then(() => {
                        if (this.areAllSubscriptionsConnected())
                            resolve();
                    })
                    .catch(err => reject(err));
                }
            );
        });
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandlers.forEach(subscriptionHandler => {
                subscriptionHandler.onTimeout(() => {
                    if (this.haveAllSubscriptionsStoppedWaiting())
                        resolve();
                });
                subscriptionHandler.receiveMessage()
                    .then(() => {
                        if (this.haveAllSubscriptionsStoppedWaiting())
                            resolve();
                    })
                    .catch(err => reject(err))
            }
            );
        });
    }

    public getReport(): Report {
        let subscriptionReports: any = [];
        let errorsDescription: string[] = [];
        let valid = true;

        for (let i = 0; i < this.subscriptionHandlers.length; ++i) {
            const subscriptionHandler = this.subscriptionHandlers[i];
            const subscriptionReport = subscriptionHandler.getReport();
            subscriptionReports.push(subscriptionReport);
            for (let j = 0; subscriptionReport.errorsDescription && j < subscriptionReport.errorsDescription.length; ++j) {
                errorsDescription.push(`[${j}] ` + subscriptionReport.errorsDescription[j]);
            }
            valid = valid && subscriptionReport.valid;
        };
        return {
            subscriptions: subscriptionReports,
            valid: valid,
            errorsDescription: errorsDescription
        };
    }

    private areAllSubscriptionsConnected(): boolean {
        ++this.subscriptionsConnectionCompletedCounter;
        return (this.subscriptionsConnectionCompletedCounter >= this.subscriptionHandlers.length)
    }

    private haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        return (this.subscriptionsStoppedWaitingCounter >= this.subscriptionHandlers.length);
    }

}