import {SubscriptionReporter} from "../reporters/subscription/subscription-reporter";
import {RunnableParser} from "../runnables/runnable-parser";
import {RunnableModel} from "../models/inputs/runnable-model";

export class SingleRunInput {

    private runnableParser: RunnableParser;
    private subscriptionReporter: SubscriptionReporter;
    private executorTimeout: Function | null = null;

    constructor(fileNamePattern: string) {
        this.subscriptionReporter = new SubscriptionReporter(
            {
                type: 'file-name-watcher',
                name: 'SingleRunInput',
                fileNamePattern: fileNamePattern,
                timeout: 1000
            });
        this.runnableParser = new RunnableParser();
    }

    public syncDir(): Promise<void> {
        return this.subscriptionReporter.connect();
    }

    public onNoMoreFilesToBeRead(executorTimeout: Function): void {
        this.executorTimeout = executorTimeout;
    }

    public receiveRequisition(): Promise<RunnableModel> {
        if (this.executorTimeout)
            this.subscriptionReporter.startTimeout(this.executorTimeout);
        return this.subscriptionReporter
            .receiveMessage()
            .then((unparsed: string) => this.runnableParser.parse(unparsed));
    }

}