import {RequisitionModel} from '../../models/outputs/requisition-model';
import {DateController} from '../../timers/date-controller';
import {TestModel} from '../../models/outputs/test-model';

export class RequisitionDefaultReports {

    private static createDefaultReport(name: string, tests: TestModel[] = []): RequisitionModel {
        const valid = tests.every((test) => test.valid);
        return {
            valid: valid,
            tests: tests,
            name: name,
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

    public static createRunningError(name: string, err: any): RequisitionModel {
        return RequisitionDefaultReports.createDefaultReport(name, [{
            valid: false,
            name: 'Requisition ran',
            description: err
        }]);
    }

    public static createSkippedReport(name: string): RequisitionModel {
        return RequisitionDefaultReports.createDefaultReport(name, [{
                valid: true,
                name: 'Requisition skipped',
                description: 'There is no iterations set to this requisition'
            }]);
    }

    public static createIteratorReport(name: string): RequisitionModel {
        return RequisitionDefaultReports.createDefaultReport(name + ' iterator collection');
    }

}
