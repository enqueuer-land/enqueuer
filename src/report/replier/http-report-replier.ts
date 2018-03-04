import { ReportReplier } from "./report-replier";
import {Configuration} from "../../conf/configuration";
const request = require("request");

export class HttpReportReplier implements ReportReplier {

    private endpoint: string = "";
    constructor(http: any) {
        this.endpoint = http.endpoint;
    }

    report(report: string): boolean {
        request.post({
                        url: this.endpoint,
                        body: report
                    },
                    (error: any, response: any, body: any) =>
                        {
                            if (error) {
                                if (Configuration.isVerboseMode())
                                    console.log("Error to reply http report : "  + error)
                            }
                        });

        return true;
    }
}