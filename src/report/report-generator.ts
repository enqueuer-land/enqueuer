import {Configuration} from "../conf/configuration";

export class ReportGenerator {

    private requisitionReports: any = [];
    private startEventReports: any = [];
    private subscriptionReports: any = [];
    private verboseMode: boolean = true;

    constructor() {
        this.verboseMode = Configuration.isVerboseMode();
    }
    
    public addRequisitionReports(requisitionReports: any): void {
        if (this.verboseMode)
            console.log(requisitionReports);
        for (const key in requisitionReports) {
            this.requisitionReports[key] = requisitionReports[key];
        }
    }
    
    public addStartEventReport(startEventReports: any): any {
        if (this.verboseMode)
            console.log(startEventReports);
        this.startEventReports = startEventReports;
    }

    public addSubscriptionReport(subscriptionReport: any): void {
        if (this.verboseMode)
            console.log(subscriptionReport);
        this.subscriptionReports.push(subscriptionReport);
    }

    public generate(): string {
        let clone = JSON.parse(JSON.stringify(this));
        delete clone.verboseMode;
        return JSON.stringify(clone);
    }

}