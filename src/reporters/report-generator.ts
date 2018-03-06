export class ReportGenerator {

    private requisitionReports: any = {};
    private startEventReports: any = [];
    private subscriptionReports: any = [];

    public addRequisitionReports(requisitionReports: any): void {
        for (const key in requisitionReports) {
            this.requisitionReports[key] = requisitionReports[key];
        }
    }
    
    public addStartEventReport(startEventReports: any): any {
        this.startEventReports = startEventReports;
    }

    public addSubscriptionReport(subscriptionReport: any): void {
        this.subscriptionReports.push(subscriptionReport);
    }

    public generate(): string {
        return JSON.stringify(this);
    }

}