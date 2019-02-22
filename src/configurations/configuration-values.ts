import {PublisherModel} from '../models/inputs/publisher-model';

export interface ConfigurationValues {
    name?: string;
    parallel: boolean;
    files: string[];
    logLevel: string;
    outputs: PublisherModel[];
    store: any;
    quiet: boolean;
    plugins: string[];
    addSingleRun: string[];
    addSingleRunIgnore: string[];
}
