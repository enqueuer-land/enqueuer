import { Report } from "./report";
import { CommandLineParser } from "../command-line/command-line-parser";

export class ReportGenerator {

    private info: any = {};
    private publishReports: any = [];
    private subscriptionReports: any = {};
    private verboseMode: boolean = true;

    constructor() {
        this.verboseMode = !CommandLineParser.getInstance().getOptions().silentMode;
    }
    
    public addInfo(infoMessage: any): void {
        if (this.verboseMode)
            console.log(infoMessage);
        for (const key in infoMessage) {
            this.info[key] = infoMessage[key];
        }
    }
    
    public addPublishReport(publishReports: any): any {
        if (this.verboseMode)
            console.log(publishReports);
        this.publishReports = publishReports;
    }

    public addSubscriptionReport(title: string, subscriptionReport: any): void {
        if (this.verboseMode)
            console.log(subscriptionReport);
        this.subscriptionReports[title] = subscriptionReport;
    }

    public generate(): Report {
        return new Report(this.info,
                            this.publishReports,
                            this.subscriptionReports);
    }

}