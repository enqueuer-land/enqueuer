import {StartEventModel} from '../../models/outputs/start-event-model';

export abstract class StartEventReporter {
    abstract start(): Promise<void>;
    abstract getReport(): StartEventModel;

    public async onFinish(): Promise<void> {
        //hook method
    }
}