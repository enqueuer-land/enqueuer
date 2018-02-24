import { ReportReplier } from "./report-replier";
import { StandardOutputReporterReplier } from "./standard-output-report-replier";
import { FileReportReplier } from "./file-report-replier";
import { HttpReportReplier } from "./http-report-replier";
import { MqttReportReplier } from "./mqtt-report-replier";
import {Requisition} from "../service/requisition/requisition";

export class ReportReplierFactory {
    createReplierFactory(requisition: Requisition): ReportReplier[] {
        const reports = requisition.reports;
        let reportRepliers: ReportReplier[] = [];
        if (reports.standardOutput)
            reportRepliers.push(new StandardOutputReporterReplier());
        if (reports.file)
            reportRepliers.push(new FileReportReplier(reports.file));
        if (reports.http)
            reportRepliers.push(new HttpReportReplier(reports.http));
        if (reports.mqtt)
            reportRepliers.push(new MqttReportReplier(reports.mqtt));
        return reportRepliers;
    }
}
