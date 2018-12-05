import * as output from '../../models/outputs/requisition-model';
import {DateController} from '../../timers/date-controller';
import {TestModel} from '../../models/outputs/test-model';

export class RequisitionDefaultReports {

    public static createDefaultReport(base: {name: string, id?: string}, tests: TestModel[] = []): output.RequisitionModel {
        const valid = tests.length > 0 ? tests.every((test) => test.valid) : true;
        return {
            valid: valid,
            tests: tests,
            name: base.name,
            id: base.id,
            subscriptions: [],
            publishers: [],
            time: {
                startTime: new DateController().toString(),
                endTime: new DateController().toString(),
                totalTime: 0
            },
            requisitions: []
        };
    }

    public static createRunningError(base: {name: string, id?: string}, err: any): output.RequisitionModel {
        return RequisitionDefaultReports.createDefaultReport(base, [{
            valid: false,
            name: 'Requisition ran',
            description: err
        }]);
    }

    public static createSkippedReport(base: {name: string, id?: string}): output.RequisitionModel {
        return RequisitionDefaultReports.createDefaultReport(base, [{
                valid: true,
                name: 'Requisition skipped',
                description: 'There is no iterations set to this requisition'
            }]);
    }

    public static createIteratorReport(base: {name: string, id?: string}): output.RequisitionModel {
        return RequisitionDefaultReports.createDefaultReport(base);
    }

}
