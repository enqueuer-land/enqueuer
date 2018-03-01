import { Report } from "./report";
import { CommandLineParser } from "../command-line/command-line-parser";

export class ReportGenerator {

    private info: any = {};
    private startEventReports: any = [];
    private subscriptionReports: any = [];
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
    
    public addStartEventReport(publishReports: any): any {
        if (this.verboseMode)
            console.log(publishReports);
        this.startEventReports = publishReports;
    }

    public addSubscriptionReport(subscriptionReport: any): void {
        if (this.verboseMode)
            console.log(subscriptionReport);
        this.subscriptionReports.push(subscriptionReport);
    }

    public generate(): Report {
        return new Report(this.info,
                            this.startEventReports,
                            this.subscriptionReports);
    }

}