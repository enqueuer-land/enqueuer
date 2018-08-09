import {SubscriptionReporter} from '../reporters/subscription/subscription-reporter';
import {RunnableParser} from '../runnables/runnable-parser';

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
                timeout: 100
            });
        this.runnableParser = new RunnableParser();
    }

    public syncDir(): Promise<void> {
        return this.subscriptionReporter.connect();
    }

    public onNoMoreFilesToBeRead(executorTimeout: Function): void {
        this.executorTimeout = executorTimeout;
    }

    public receiveRequisition(): Promise<any> {
        if (this.executorTimeout) {
            this.subscriptionReporter.startTimeout(this.executorTimeout);
        }
        return this.subscriptionReporter
            .receiveMessage()
            .then((file: any) => {
                file.content = this.runnableParser.parse(file.content);
                return file;
            });
    }

}