import { ReportGenerator } from "../report/report-generator";
import { MessengerService, MessengerServiceCallback } from "../service/messenger-service";
import { Requisition } from "./requisition/requisition";
import {PublishPrePublishingExecutor} from "../function-executor/publish-pre-publishing-executor";
import {StartEvent} from "./requisition/start-event/start-event";
import {SubscriptionsHandler} from "./subscriptions-handler";

export class EnqueuerService implements MessengerService {
    private startEvent: StartEvent;
    private subscriptionsHandler: SubscriptionsHandler;
    private onFinishCallback: MessengerServiceCallback | null = null;
    private startTime: number = 0;
    private timer: NodeJS.Timer | null = null;
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(requisition: Requisition) {
        this.startEvent = requisition.startEvent;
        this.subscriptionsHandler = new SubscriptionsHandler(requisition.subscriptions);
    }

    public start(onFinishCallback: MessengerServiceCallback): void {
        this.startTime = Date.now();
        this.reportGenerator.addInfo({startTime: new Date().toString()})
        this.onFinishCallback = onFinishCallback;
        this.subscriptionsHandler.start(() => this.onSubscriptionCompleted(),
                                         () => this.onFinish());
    }

    private onSubscriptionCompleted() {
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

    private onFinish(): void {
        if (this.timer)
            global.clearTimeout(this.timer);

        const totalTime = Date.now() - this.startTime;

        this.reportGenerator.addSubscriptionReport(this.subscriptionsHandler.getReports());


        this.subscriptionsHandler.unsubscribe();

        this.reportGenerator.addInfo({endTime: new Date().toString(), totalTime: totalTime})
        
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    }
}