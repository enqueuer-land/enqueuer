import { ReportReplier } from "./report-replier";
import { StandardOutputReporterReplier } from "./standard-output-report-replier";
import { FileReportReplier } from "./file-report-replier";
import { HttpReportReplier } from "./http-report-replier";
// import { MqttReportReplier } from "./mqtt-report-replier";

export class ReportReplierFactory {
    createReplierFactory(requisition: any): ReportReplier[] {
        const parsedRequisition = JSON.parse(requisition).reports;
        let reportRepliers: ReportReplier[] = [];
        if (parsedRequisition.standardOutput)
            reportRepliers.push(new StandardOutputReporterReplier());
        if (parsedRequisition.file)
            reportRepliers.push(new FileReportReplier(parsedRequisition.file));
        if (parsedRequisition.http)
            reportRepliers.push(new HttpReportReplier(parsedRequisition.http));
        // if (parsedRequisition.mqtt)
        //     reportRepliers.push(new MqttReportReplier(parsedRequisition.mqtt));
        return reportRepliers;
    }
}
