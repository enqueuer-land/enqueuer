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
    private reportGenerator: ReportGenerator = new ReportGenerator();

    constructor(requisition: Requisition) {
        this.startEventHandler = new StartEventHandler(requisition.startEvent);
        this.startEventHandler.setTimeoutCallback(() => this.onFinish());
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
            .catch(err => {
                this.onFinish();
            })
    }

    private onFinish(): void {
        const totalTime = Date.now() - this.startTime;

        this.startEventHandler.cancelTimeout();
        this.reportGenerator.addSubscriptionReport(this.subscriptionsHandler.getReports());
        this.reportGenerator.addStartEventReport(this.startEventHandler.getReport());


        this.subscriptionsHandler.unsubscribe();

        this.reportGenerator.addInfo({endTime: new Date().toString(), totalTime: totalTime})
        
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    }
}