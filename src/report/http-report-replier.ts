import { ReportReplier } from "./report-replier";
import { Report } from "./report";
import { CommandLineParser } from "../command-line/command-line-parser";
const request = require("request");

export class HttpReportReplier implements ReportReplier {

    private endpoint: string = "";
    constructor(http: any) {
        this.endpoint = http.endpoint;
    }

    report(report: Report): boolean {
        request.post({
                        url: this.endpoint,
                        body: report.toString()
                    },
                    (error: any, response: any, body: any) =>
                        {
                            if (error) {
                                if (!CommandLineParser.getInstance().getOptions().silentMode)
                                    console.log("Error to reply http report : "  + error)
                            }
                        });

        return true;
    }
}