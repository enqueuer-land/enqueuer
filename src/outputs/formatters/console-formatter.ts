import {ReportFormatter} from './report-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import prettyjson from 'prettyjson';
import {ObjectDecycler} from '../../object-notations/object-decycler';
import {MainInstance} from '../../plugins/main-instance';
import {getPrettyJsonConfig} from '../prettyjson-config';

export class ConsoleFormatter implements ReportFormatter {

    public format(report: RequisitionModel): string {
        return prettyjson.render(new ObjectDecycler().decycle(report), getPrettyJsonConfig());
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.reportFormatterManager.addReportFormatter(() => new ConsoleFormatter(), 'console', 'stdout');
}
