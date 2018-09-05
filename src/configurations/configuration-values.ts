import {PublisherModel} from '../models/inputs/publisher-model';
import {SubscriptionModel} from '../models/inputs/subscription-model';

export interface ConfigurationValues {
    logLevel: string;
    runMode: {
        daemon: SubscriptionModel[],
        'single-run': {
            name: string;
            reportName: string;
            parallel: boolean;
            files: string[];
        }
    };
    outputs: PublisherModel[];
    store: any;
    quiet: boolean;
}
