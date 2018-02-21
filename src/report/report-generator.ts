import { Report } from "./report";

export class ReportGenerator {

    private info: any = {};
    private publishReports: any = [];
    private subscriptionReports: any = {};
    
    public addInfo(infoMessage: any): void {
        for (const key in infoMessage) {
            this.info[key] = infoMessage[key];
        }
    }
    
    public addPublishReport(publishReports: any): any {
        this.publishReports = publishReports;
    }

    public addSubscriptionReport(title: string, subscriptionReport: any): void {
        this.subscriptionReports[title] = subscriptionReport;
    }

    public generate(): Report {
        return new Report(this.info,
                            this.publishReports,
                            this.subscriptionReports);
    }

}