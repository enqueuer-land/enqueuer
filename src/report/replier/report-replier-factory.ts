import { ReportReplier } from "./report-replier";
import { StandardOutputReporterReplier } from "./standard-output-report-replier";
import { FileReportReplier } from "./file-report-replier";
import { HttpReportReplier } from "./http-report-replier";
import { MqttReportReplier } from "./mqtt-report-replier";

export class ReportReplierFactory {

    private report: string;

    constructor(report: string) {
        this.report = report;
    }

    public createReportPublishers(reportsAttributes: any): ReportReplier[] {
        let reportRepliers: ReportReplier[] = [];
        reportsAttributes.forEach((report: any) => {
            //TODO PublisherFactory
            report.payload = this.report;
            const protocol: string = report.protocol;
            if (protocol === "standardOutput")
                reportRepliers.push(new StandardOutputReporterReplier(report));
            if (protocol === "file")
                reportRepliers.push(new FileReportReplier(report));
            if (protocol === "http")
                reportRepliers.push(new HttpReportReplier(report));
            if (protocol === "mqtt")
                reportRepliers.push(new MqttReportReplier(report));
        });
        return reportRepliers;
    }
}
