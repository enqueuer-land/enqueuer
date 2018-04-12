import {SubscriptionModel} from "../../requisitions/models/subscription-model";
import {Report} from "../report";
import {Reporter} from "../reporter";
import {SubscriptionReporter} from "./subscription-reporter";

export class MultiSubscriptionsReporter implements Reporter {
    private subscriptionHandlers: SubscriptionReporter[] = [];
    private subscriptionsStoppedWaitingCounter: number = 0;

    constructor(subscriptionsAttributes: SubscriptionModel[]) {
        for (let id: number = 0; id < subscriptionsAttributes.length; ++id) {
            this.subscriptionHandlers.push(new SubscriptionReporter(subscriptionsAttributes[id]));
        }
    }

    public connect(): Promise<void[]> {
        return Promise.all(this.subscriptionHandlers.map(
            subscriptionHandler => subscriptionHandler.connect()
            ));
    }

    public receiveMessage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionHandlers.forEach(subscriptionHandler => {
                subscriptionHandler.startTimeout(() => {
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
            const subscriptionReport = this.subscriptionHandlers[i].getReport();
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

    private haveAllSubscriptionsStoppedWaiting() {
        ++this.subscriptionsStoppedWaitingCounter;
        return (this.subscriptionsStoppedWaitingCounter >= this.subscriptionHandlers.length);
    }

}