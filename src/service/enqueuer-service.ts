import {classToClass} from "class-transformer";
import { Requisition, Subscription } from "./requisition/requisition"
import { ReportGenerator } from "../report/report-generator";
import { Report } from "../report/report";
import { MessengerService, MessengerServiceCallback } from "../service/messenger-service";
import { SubscriptionOnMessageReceivedExecutor } from "../function-executor/subscription-on-message-received-executor";
import { PublishPrePublishingExecutor } from "../function-executor/publish-pre-publishing-executor";

var mqtt = require('mqtt');

export class EnqueuerService implements MessengerService {
    private client: any;
    private requisition: Requisition;
    private onFinishCallback: MessengerServiceCallback | null = null;
    private startTime: number = 0;
    private timer: NodeJS.Timer | null = null;
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(requisition: Requisition) {
        this.requisition = classToClass(requisition); //clone
        this.client = mqtt.connect(requisition.brokerAddress);//, {connectTimeout:1000});
        this.client.on('message', 
                    (topic: string, message: string) => this.onMessageReceived(topic, message));
        this.subscribeToTopics();
    }
    
    public start(onFinishCallback: MessengerServiceCallback): void {
        this.reportGenerator.addInfo({startTime: new Date().toString()})
        this.onFinishCallback = onFinishCallback;
        this.client.on('connect', () => this.onConnect());
    }

    private onConnect(): void {
        this.startTime = Date.now();
        this.setTimeout();
        this.publish();
    }

    private publish(): void {
        if (this.requisition.startEvent.publish) {
            this.client.publish(this.requisition.startEvent.publish.topic,
                                this.requisition.startEvent.publish.payload);

            const ellapsedTime = Date.now() - this.startTime;
            let warning = {};
            try {
                new PublishPrePublishingExecutor(this.requisition.startEvent.publish, {payload: this.requisition.startEvent.publish.payload,
                    topic: this.requisition.startEvent.publish.topic});
            }
            catch (exception) {
                warning = exception;
            }

            this.reportGenerator.addPublishReport({
                                                    payload: this.requisition.startEvent.publish.payload,
                                                    topic: this.requisition.startEvent.publish.topic,
                                                    ellapsedTime: ellapsedTime,
                                                    warning: warning
                                                });                        
        }
    }
    
    private setTimeout(): void {
        let totalTimeout = -1;
        this.requisition.subscriptions.forEach(
            (subscription: Subscription) => {
                const subscriptionTimeout = subscription.timeout;
                if (subscriptionTimeout && subscriptionTimeout > totalTimeout)
                    totalTimeout = subscriptionTimeout;
            });

        this.reportGenerator.addInfo({totalTimeout: totalTimeout});
        if (totalTimeout != -1) {
            this.timer = global.setTimeout(() => this.onFinish(), totalTimeout);
        }
    }
    
    private onMessageReceived(topic: string, payloadBuffer: string): void {
        const payload: string = payloadBuffer.toString();
        const ellapsedTime = Date.now() - this.startTime;

        var index = this.requisition.subscriptions.findIndex((subscription: Subscription) => {
            return subscription.topic == topic;
        });

        if (index > -1) {
            let subscription: Subscription = this.requisition.subscriptions[index];
            this.requisition.subscriptions.splice(index, 1);
            this.generateSubscriptionReceivedMessageReport(subscription, {payload: payload, topic: topic});

            if (this.requisition.subscriptions.length === 0) {
                this.onFinish();
            }
        }
    }

    private generateSubscriptionReceivedMessageReport(subscription: Subscription, message: any) {
        const ellapsedTime = Date.now() - this.startTime;

        let onMessageReceived = {};
        if (message) {
            try {
                let subscriptionTestExecutor: SubscriptionOnMessageReceivedExecutor
                                = new SubscriptionOnMessageReceivedExecutor(subscription, this.requisition.startEvent.publish, message);
    
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
        }

        var subscriptionReport = {
            ...subscription,
            ellapsedTime: ellapsedTime,
            timestamp: new Date(),
            message: message
        };
        this.reportGenerator.addSubscriptionReport(subscriptionReport);
    }
    
    private generateSubscriptionDidNotReceivedMessageReport(subscription: Subscription) {
        const ellapsedTime = Date.now() - this.startTime;

        var subscriptionReport = {
            ...subscription,
            ellapsedTime: ellapsedTime,
            hasTimedOut: true
        };
        this.reportGenerator.addSubscriptionReport(subscriptionReport);
    }
    
    private subscribeToTopics(): void {
        this.requisition.subscriptions
                .forEach((subscription: Subscription) => {
                    this.client.subscribe(subscription.topic)
                });
    }

    private onFinish(): void {
        if (this.timer) 
            global.clearTimeout(this.timer);

        this.client.end(true);
        const totalTime = Date.now() - this.startTime;

        this.requisition.subscriptions
                .forEach((subscription: Subscription) => {
                    this.generateSubscriptionDidNotReceivedMessageReport(subscription);
                });

        this.reportGenerator.addInfo({endTime: new Date().toString()})
        
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    }
}