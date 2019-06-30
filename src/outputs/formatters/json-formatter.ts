import {ReportFormatter} from './report-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {MainInstance} from '../../plugins/main-instance';
import {Logger} from '../../loggers/logger';

export class JsonReportFormatter implements ReportFormatter {
    public format(report: RequisitionModel): string {
        try {
            return JSON.stringify(report, null, 2);
        } catch (e) {
            Logger.warning(e);
            throw e;
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new JsonReportFormatter(), 'json');
}
