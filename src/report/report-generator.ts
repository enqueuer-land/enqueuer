import { Report } from "./report";

export class ReportGenerator {

    private infoMessages: string[] = [];
    private publishReports: any[] = [];
    private subscriptionReports: any[] = [];
    private errors: string[] = [];
    
    public addInfo(infoMessage: string): void {
        this.infoMessages.push(infoMessage);
    }
    
    public addPublishReport(publishReports: any): any {
        this.publishReports = publishReports;
    }

    public addSubscriptionReport(subscriptionReport: any): void {
        this.subscriptionReports.push(subscriptionReport);
    }

    public addError(error: string): void {
        this.errors.push(error);
    }

    public generate(): Report {
        return new Report(this.infoMessages,
                            this.errors,
                            this.publishReports,
                            this.subscriptionReports);
    }

}