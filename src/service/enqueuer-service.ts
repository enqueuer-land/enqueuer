import {classToClass} from "class-transformer";
import { ReportGenerator } from "../report/report-generator";
import { MessengerService, MessengerServiceCallback } from "../service/messenger-service";
import { SubscriptionOnMessageReceivedExecutor } from "../function-executor/subscription-on-message-received-executor";
import { Requisition } from "./requisition/requisition";
import {SubscriptionSuperClass} from "./requisition/subscription/subscription-super-class";
import {PublishPrePublishingExecutor} from "../function-executor/publish-pre-publishing-executor";
import {StartEvent} from "./requisition/start-event/start-event";
import {Subscription} from "./requisition/subscription/subscription";

export class EnqueuerService implements MessengerService {
    private startEvent: StartEvent;
    private subscriptions: Subscription[] = [];
    private onFinishCallback: MessengerServiceCallback | null = null;
    private startTime: number = 0;
    private timer: NodeJS.Timer | null = null;
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(requisition: Requisition) {
        this.startEvent = requisition.startEvent;
        this.subscriptions = requisition.subscriptions;
    }

    public start(onFinishCallback: MessengerServiceCallback): void {
        this.startTime = Date.now();
        this.reportGenerator.addInfo({startTime: new Date().toString()})
        this.onFinishCallback = onFinishCallback;
        this.subscribeSubscriptions();
    }

    private onSubscriptionCompleted(subscription: SubscriptionSuperClass) {
        console.log("I have to count how many subscriptions are completed");
        this.startEvent.execute((message: any) => this.onStartEventReceived(message));
    }

    private onStartEventReceived(startEvent: any) {
        console.log("Start event was fired");
        this.startEvent.payload = startEvent.payload;

        this.setTimeout(this.startEvent.timeout);

        const elapsedTime = Date.now() - this.startTime;
        // let warning = {};
        // try {
        //     new PublishPrePublishingExecutor(this.requisition.startEvent.publish, {payload: this.requisition.startEvent.publish.mqtt.payload,
        //         topic: this.requisition.startEvent.publish.mqtt.topic});
        // }
        // catch (exception) {
        //     warning = exception;
        // }

        this.reportGenerator.addPublishReport({
                                                publish: this.startEvent.publish,
                                                elapsedTime: elapsedTime
                                            });

    }

    // private publish(): void {
    //     console.log("onPublish");
    //     if (this.requisition.startEvent && this.requisition.startEvent.publish)
    //         this.requisition.startEvent.publish.execute();
    //
    //     if (this.requisition.startEvent && this.requisition.startEvent.publish  && this.requisition.startEvent.publish.mqtt) {
    //         this.client.publish(this.requisition.startEvent.publish.mqtt.topic,
    //                             this.requisition.startEvent.publish.mqtt.payload);
    //
    //         const elapsedTime = Date.now() - this.startTime;
    //         let warning = {};
    //         try {
    //             new PublishPrePublishingExecutor(this.requisition.startEvent.publish, {payload: this.requisition.startEvent.publish.mqtt.payload,
    //                 topic: this.requisition.startEvent.publish.mqtt.topic});
    //         }
    //         catch (exception) {
    //             warning = exception;
    //         }
    //
    //         this.reportGenerator.addPublishReport({
    //                                                 publish: this.requisition.startEvent.publish,
    //                                                 elapsedTime: elapsedTime,
    //                                                 warning: warning
    //                                             });
    //     }
    // }

    private setTimeout(totalTimeout: number): void {
        console.log("timeout: " + totalTimeout)
        if (totalTimeout != -1) {
            this.reportGenerator.addInfo({totalTimeout: totalTimeout});
            this.timer = global.setTimeout(() => this.onFinish(), totalTimeout);
        }
    }

    // private onMessageReceived(topic: string, payloadBuffer: string): void {
    //     const payload: string = payloadBuffer.toString();
    //
    //     var index = this.requisition.subscriptions.findIndex((subscription: Subscription) => {
    //         return subscription.mqtt != null && subscription.mqtt.topic == topic;
    //     });
    //
    //     if (index > -1) {
    //         let subscription: Subscription = this.requisition.subscriptions[index];
    //         this.requisition.subscriptions.splice(index, 1);
    //         this.generateSubscriptionReceivedMessageReport(subscription, {payload: payload, topic: topic});
    //
    //         if (this.requisition.subscriptions.length === 0) {
    //             this.onFinish();
    //         }
    //     }
    // }

    private generateSubscriptionReceivedMessageReport(subscription: SubscriptionSuperClass) {
        const elapsedTime = Date.now() - this.startTime;

        let onMessageReceived = {};
            try {
                let subscriptionTestExecutor: SubscriptionOnMessageReceivedExecutor
                                = new SubscriptionOnMessageReceivedExecutor(subscription, this.startEvent.publish);

                subscriptionTestExecutor.execute();

                onMessageReceived = {
                    tests: {
                        failing: subscriptionTestExecutor.getFailingTests(),
                        passing: subscriptionTestExecutor.getPassingTests(),
                        onMessageReceivedExecutionException: subscriptionTestExecutor.getWarning()
                    },
                    reports: subscriptionTestExecutor.getReports()
                }
            } catch (exc) {
                onMessageReceived = {
                    onMessageReceivedFunctionCreationException: exc
                }
            }

        var subscriptionReport = {
            ...subscription,
            elapsedTime: elapsedTime,
            timestamp: new Date(),
            onMessageReceived: onMessageReceived
        };
        this.reportGenerator.addSubscriptionReport(subscriptionReport);
    }
    //
    // private generateSubscriptionDidNotReceivedMessageReport(subscription: Subscription) {
    //     const elapsedTime = Date.now() - this.startTime;
    //
    //     var subscriptionReport = {
    //         ...subscription,
    //         elapsedTime: elapsedTime,
    //         hasTimedOut: true
    //     };
    //     this.reportGenerator.addSubscriptionReport(subscriptionReport);
    // }

    private onSubscriptionMessage(subscription: SubscriptionSuperClass) {
            this.generateSubscriptionReceivedMessageReport(subscription);

            // if (this.requisition.subscriptions.length === 0) {
            //     this.onFinish();
            // }

    }

    private subscribeSubscriptions(): void {
        this.subscriptions
                .forEach(subscription =>
                    subscription.subscribe((subscription: SubscriptionSuperClass) => this.onSubscriptionMessage(subscription),
                        (subscription: SubscriptionSuperClass) => this.onSubscriptionCompleted(subscription)));
    }

    private onFinish(): void {
        if (this.timer)
            global.clearTimeout(this.timer);

        const totalTime = Date.now() - this.startTime;

        this.subscriptions.forEach(subscription =>
            subscription.unsubscribe());

        this.reportGenerator.addInfo({endTime: new Date().toString(), totalTime: totalTime})
        
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    }
}