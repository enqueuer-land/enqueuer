import {Logger} from "../log/logger";

export class ReportGenerator {

    private requisitionReports: any = [];
    private startEventReports: any = [];
    private subscriptionReports: any = [];

    public addRequisitionReports(requisitionReports: any): void {
        Logger.info(requisitionReports);
        for (const key in requisitionReports) {
            this.requisitionReports[key] = requisitionReports[key];
        }
    }
    
    public addStartEventReport(startEventReports: any): any {
        Logger.info(startEventReports);
        this.startEventReports = startEventReports;
    }

    public addSubscriptionReport(subscriptionReport: any): void {
        Logger.info(subscriptionReport);
        this.subscriptionReports.push(subscriptionReport);
    }

    public generate(): string {
        return JSON.stringify(this);
    }

}