import { Report } from "./report";
import {Configuration} from "../conf/configuration";

export class ReportGenerator {

    private info: any = {};
    private startEventReports: any = [];
    private subscriptionReports: any = [];
    private verboseMode: boolean = true;

    constructor() {
        this.verboseMode = Configuration.isVerboseMode();
    }
    
    public addInfo(infoMessage: any): void {
        if (this.verboseMode)
            console.log(infoMessage);
        for (const key in infoMessage) {
            this.info[key] = infoMessage[key];
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

    public generate(): Report {
        return new Report(this.info,
                            this.startEventReports,
                            this.subscriptionReports);
    }

}