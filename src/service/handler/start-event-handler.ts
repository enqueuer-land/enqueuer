// import {StartEvent} from "../../requisition/start-event/start-event";
// import {SubscriptionsHandler} from "./subscriptions-handler";
// import {StartEventPublisherHandler} from "./publisher-handler";
// import {Publisher} from "../../requisition/start-event/publish/publisher";
// import {PublisherFactory} from "../../requisition/start-event/publish/publisher-factory";
//
// export class StartEventHandler {
//
//     private publisherHandler: StartEventPublisherHandler | null = null;
//     private subscriptionHandler: SubscriptionsHandler | null = null;
//     private report: any = {};
//     private timer: NodeJS.Timer | null = null;
//     private timeout: number = -1;
//     private onTimeoutCallback: () => void = () => {};
//
//     constructor(startEvent: StartEvent) {
//         if (startEvent.publisher) {
//             const publisher: Publisher | null = new PublisherFactory().createPublisher(startEvent.publisher);
//             if (publisher)
//                 this.publisherHandler = new StartEventPublisherHandler(publisher);
//         }
//         else if (startEvent.subscription)
//             this.subscriptionHandler = new SubscriptionsHandler([startEvent.subscription]);
//         this.timeout = startEvent.timeout;
//     }
//
//     public start(): Promise<void | {}> {
//
//         return new Promise((resolve, reject) => {
//
//             if (this.publisherHandler) {
//                 if (!this.timer)
//                     this.setTimeout();
//                 this.publisherHandler.start()
//                     .then((publisher: Publisher) => {
//                         this.generatePublishSuccessfulReport();
//                         resolve();
//                     })
//                     .catch(error => {
//                         this.generatePublishErrorReport(error);
//                         reject(error);
//                     });
//             }
//             if (this.subscriptionHandler) {
//                     this.subscriptionHandler.start(() => {},
//                         () => {
//                             this.checkSubscriptionMessageReceived()
//                                 .then(() => {
//                                     if (!this.timer)
//                                         this.setTimeout();
//                                     resolve();
//                                 })
//                                 .catch(() => reject());
//                         });
//             }
//         }).catch( () => {
//             if (this.subscriptionHandler)
//                 return this.start();
//         });
//     }
//
//     public getReport(): any {
//         return this.report;
//     }
//
//     public cancelTimeout() {
//         if (this.timer)
//             global.clearTimeout(this.timer);
//         this.timer = null;
//     }
//
//     public setTimeoutCallback(timeoutCallback: () => void) {
//         this.onTimeoutCallback = timeoutCallback;
//     }
//
//     private onTimeout(): any {
//         this.cancelTimeout();
//         this.onTimeoutCallback();
//     }
//
//     private setTimeout(): void {
//         if (this.timeout != -1) {
//             this.timer = global.setTimeout(() => this.onTimeout(), this.timeout);
//         }
//     }
//
//     private generatePublishSuccessfulReport() {
//         if (this.publisherHandler)
//             this.report = this.publisherHandler.getReport();
//         this.report.timeout = this.timeout;
//     }
//
//     private generatePublishErrorReport(error: String): void {
//         this.report = {
//             error,
//             timestamp: new Date()
//         }
//         this.report.timeout = this.timeout;
//     }
//
//     private checkSubscriptionMessageReceived(): Promise<void> {
//         return new Promise((resolve, reject) => {
//             if (this.subscriptionHandler) {
//                 const subscriptionReport = this.subscriptionHandler.getReports();
//                 this.report = subscriptionReport;
//                 this.report.valid = subscriptionReport[0].onMessageReceived.tests.failing.length > 0;
//                 this.report.timeout = this.timeout;
//                 resolve();
//             }
//             reject();
//         });
//     }
//
// }