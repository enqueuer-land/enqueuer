import {StartEventReporter} from './start-event-reporter';
import {SubscriptionReporter} from '../subscription/subscription-reporter';
import {SubscriptionModel} from '../../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {StartEventModel} from '../../models/outputs/start-event-model';
import {checkValidation} from '../../models/outputs/report-model';
import {Logger} from '../../loggers/logger';

@Injectable({predicate: (startEvent: any) => startEvent.subscription})
export class StartEventSubscriptionReporter extends StartEventReporter {

    private subscriptionReporter: SubscriptionReporter;

    public constructor(startEvent: SubscriptionModel) {
        super();
        if (!startEvent.subscription.name) {
            startEvent.subscription.name = `Start event subscription`;
        }
        this.subscriptionReporter = new SubscriptionReporter(startEvent.subscription);
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptionReporter
                .startTimeout(() => {
                    Logger.trace(`Subscription as start event has timed out`);
                    resolve();
                });
            this.subscriptionReporter.subscribe()
                .then(() => {
                    this.subscriptionReporter.receiveMessage()
                        .then(() => {
                            Logger.trace(`Subscription as start event has received its message`);
                            resolve();
                        })
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