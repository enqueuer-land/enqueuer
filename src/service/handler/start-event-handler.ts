import {StartEvent} from "../requisition/start-event/start-event";
import {SubscriptionsHandler} from "./subscriptions-handler";
import {PublisherHandler} from "./publisher-handler";
import {Publish} from "../requisition/start-event/publish/publish";
import {PublishFactory} from "../requisition/start-event/publish/publish-factory";

export class StartEventHandler {

    private publisherHandler: PublisherHandler | null = null;
    private subscriptionHandler: SubscriptionsHandler | null = null;
    private report: any = {};

    constructor(startEvent: StartEvent) {
        if (startEvent.publish) {
            const publisher: Publish | null = new PublishFactory().createPublisher(startEvent.publish);
            if (publisher)
                this.publisherHandler = new PublisherHandler(publisher);
        }
        else if (startEvent.subscription)
            this.subscriptionHandler = new SubscriptionsHandler([startEvent.subscription]);
    }

    public start(): Promise<void | {}> {
        return new Promise((resolve, reject) => {

            if (this.publisherHandler) {
                this.publisherHandler.publish()
                    .then((publisher: Publish) => {
                        this.generatePublishSuccessfulReport();
                        resolve();
                    })
                    .catch(error => {
                        this.generatePublishErrorReport(error);
                        reject(error);
                    });
            }
            if (this.subscriptionHandler) {
                    this.subscriptionHandler.start(() => {},
                        () => {
                            this.checkSubscriptionMessageReceived()
                                .then(() => {
                                    resolve();
                                })
                                .catch(() => reject());
                        });
            }
        }).catch( () => {
            console.log("reject")
            if (this.subscriptionHandler)
                return this.start();
        });
    }

    public getReport(): any {
        return this.report;
    }

    private generatePublishSuccessfulReport() {
        if (this.publisherHandler)
            this.report = this.publisherHandler.getReport();
    }

    private generatePublishErrorReport(error: String): void {
        this.report = {
            error,
            timestamp: new Date()
        }
    }

    private checkSubscriptionMessageReceived(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.subscriptionHandler) {
                const subscriptionReport = this.subscriptionHandler.getReports();
                if (subscriptionReport[0].onMessageReceived.tests.failing.length > 0) {
                    if (!this.report.failures)
                        this.report.failures = [];
                    this.report.failures.push(this.subscriptionHandler.getReports());
                    reject();
                }
                else {
                    this.report.success = this.subscriptionHandler.getReports();
                    this.subscriptionHandler.unsubscribe();
                    resolve();
                }
            }
            reject();
        });
    }


}