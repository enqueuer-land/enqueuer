import {PublisherModel} from '../models/inputs/publisher-model';
import {SubscriptionModel} from '../models/inputs/subscription-model';

export type DaemonMode = SubscriptionModel[];
export type SingleRunMode = {
    reportName?: string;
    report?: string;
    parallel: boolean;
    files: string[];
};

export interface ConfigurationValues {
    logLevel: string;
    runMode: {
        daemon: DaemonMode,
        'single-run': SingleRunMode
    };
    daemon: DaemonMode;
    'single-run': SingleRunMode;
    outputs: PublisherModel[];
    store: any;
    quiet: boolean;
    addSingleRun: string[];
    addSingleRunIgnore: string[];
}
