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
    private subscribed: boolean = false;

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
                    Logger.trace(`Subscription as start event has timed out. Subscribed: ${this.subscribed}`);
                    if (this.subscribed) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            this.subscriptionReporter.subscribe()
                .then(() => {
                    this.subscribed = true;
                    this.subscriptionReporter.receiveMessage()
                        .then(() => {
                            Logger.trace(`Subscription as start event has received its message`);
                            resolve();
                        })
                        .catch(err => reject(err));
                })
                .catch(err => {
                    Logger.error(`Subscription as start event has failed to subscribe`);
                    reject(err);
                });
        });
    }

    public async onFinish(): Promise<void> {
        this.subscriptionReporter.onFinish();
        return this.subscriptionReporter.unsubscribe();
    }

    public getReport(): StartEventModel {
        let report = this.subscriptionReporter.getReport();
        report.valid = report.valid && checkValidation(report);
        return {
            subscription: report
        };
    }
}