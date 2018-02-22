import { ReportReplier } from "./report-replier";
import { StandardOutputReporterReplier } from "./standard-output-report-replier";
import { FileReportReplier } from "./file-report-replier";

export class ReportReplierFactory {
    createReplierFactory(requisition: any): ReportReplier[] {
        const parsedRequisition = JSON.parse(requisition).report;
        let reportRepliers: ReportReplier[] = [];
        if (parsedRequisition.standardOutput)
            reportRepliers.push(new StandardOutputReporterReplier());
        if (parsedRequisition.file)
            reportRepliers.push(new FileReportReplier(parsedRequisition.file));
        return reportRepliers;
    }
}
