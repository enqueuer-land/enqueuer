import {Logger} from "../loggers/logger";
import {RequisitionParser} from "./requisition-parser";
import {RequisitionModel} from "./models/requisition-model";
import {SubscriptionReporter} from "../reporters/subscription/subscription-reporter";

export class SingleRunRequisitionInput {

    private requisitionParser: RequisitionParser;
    private subscriptionReporter: SubscriptionReporter;
    private executorTimeout: Function | null = null;

    constructor(fileNamePattern: string) {
        this.subscriptionReporter = new SubscriptionReporter(
            {
                type: 'file-name-watcher',
                fileNamePattern: fileNamePattern,
                timeout: 1000
            });
        this.requisitionParser = new RequisitionParser();
    }

    public syncDir(): Promise<void> {
        return this.subscriptionReporter.connect();
    }

    public onNoMoreFilesToBeRead(executorTimeout: Function): void {
        this.executorTimeout = executorTimeout;
    }

    public receiveRequisition(): Promise<RequisitionModel> {
        if (this.executorTimeout)
            this.subscriptionReporter.startTimeout(this.executorTimeout);
        return this.subscriptionReporter
            .receiveMessage()
            .then((unparsed: string) => {
                try {
                    return Promise.resolve(this.requisitionParser.parse(unparsed));
                }
                catch (err) {
                    Logger.error(`Error parsing requisition ${JSON.stringify(err)}`);
                    return Promise.reject(err);
                }
            })
    }

}