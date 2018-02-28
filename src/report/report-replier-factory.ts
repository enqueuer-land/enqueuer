import { ReportReplier } from "./report-replier";
import { StandardOutputReporterReplier } from "./standard-output-report-replier";
import { FileReportReplier } from "./file-report-replier";
import { HttpReportReplier } from "./http-report-replier";
import { MqttReportReplier } from "./mqtt-report-replier";
import {Requisition} from "../service/requisition/requisition";

export class ReportReplierFactory {
    createReplierFactory(requisition: Requisition): ReportReplier[] {
        const reports: any[] = requisition.reports;
        let reportRepliers: ReportReplier[] = [];
        reports.forEach(report => {
            const protocol: string = report.protocol;
            if (protocol === "standardOutput")
                reportRepliers.push(new StandardOutputReporterReplier());
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
