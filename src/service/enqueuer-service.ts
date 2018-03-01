import { ReportGenerator } from "../report/report-generator";
import { Requisition } from "./requisition/requisition";
import {SubscriptionsHandler} from "./handler/subscriptions-handler";
import {Report} from "../report/report";
import {StartEventHandler} from "./handler/start-event-handler";

export type EnqueuerServiceCallback = (report: Report) => void;
export class EnqueuerService {
    private startEventHandler: StartEventHandler;
    private subscriptionsHandler: SubscriptionsHandler;
    private onFinishCallback: EnqueuerServiceCallback | null = null;
    private startTime: number = 0;
    private timer: NodeJS.Timer | null = null;
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(requisition: Requisition) {
        this.startEventHandler = new StartEventHandler(requisition.startEvent);
        this.subscriptionsHandler = new SubscriptionsHandler(requisition.subscriptions);
    }

    public start(onFinishCallback: EnqueuerServiceCallback): void {
        this.startTime = Date.now();
        this.reportGenerator.addInfo({startTime: new Date().toString()})
        this.onFinishCallback = onFinishCallback;
        this.subscriptionsHandler.start(() => this.onSubscriptionCompleted(),
                                         () => this.onFinish());
    }

    private onSubscriptionCompleted() {
        this.startEventHandler.start()
            .then(() => this.onStartEventReceived())
            .catch(err => {
                console.log(err);
                this.onFinish();
            })
        // this.startEvent.execute((message: any) => this.onStartEventReceived(message));
    }

    private onStartEventReceived() {
        console.log("Start event was fired");

        this.setTimeout(5000);//this.startEvent.timeout);

        const elapsedTime = Date.now() - this.startTime;
        // let warning = {};
        // try {
        //     new PublishPrePublishingExecutor(this.requisition.startEvent.publish, {payload: this.requisition.startEvent.publish.mqtt.payload,
        //         topic: this.requisition.startEvent.publish.mqtt.topic});
        // }
        // catch (exception) {
        //     warning = exception;
        // }


    }

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
        this.reportGenerator.addStartEventReport(this.startEventHandler.getReport());


        this.subscriptionsHandler.unsubscribe();

        this.reportGenerator.addInfo({endTime: new Date().toString(), totalTime: totalTime})
        
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    }
}