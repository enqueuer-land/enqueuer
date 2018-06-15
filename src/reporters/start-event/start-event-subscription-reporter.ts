import {StartEventReporter} from './start-event-reporter';
import {SubscriptionReporter} from '../subscription/subscription-reporter';
import {SubscriptionModel} from '../../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {StartEventModel} from '../../models/outputs/start-event-model';
import {checkValidation} from '../../models/outputs/report-model';

@Injectable({predicate: (startEvent: any) => startEvent.subscription != null})
export class StartEventSubscriptionReporter extends StartEventReporter {

    private subscriptionReporter: SubscriptionReporter;

    public constructor(startEvent: SubscriptionModel) {
        super();
        this.subscriptionReporter = new SubscriptionReporter(startEvent.subscription);
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionReporter.connect()
                .then(() => {
                    this.subscriptionReporter
                        .startTimeout(() => resolve());
                    this.subscriptionReporter.receiveMessage()
                        .then(() => resolve())
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    public getReport(): StartEventModel {
        let report = this.subscriptionReporter.getReport();
        report.valid = report.valid && checkValidation(report);
        return {
            subscription: report
        };
    }
}