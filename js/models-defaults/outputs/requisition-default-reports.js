"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../../timers/date-controller");
class RequisitionDefaultReports {
    static createDefaultReport(name, tests = []) {
        const valid = tests.every((test) => test.valid);
        return {
            valid: valid,
            tests: tests,
            name: name,
            subscriptions: [],
            startEvent: {},
            time: {
                startTime: new date_controller_1.DateController().toString(),
                endTime: new date_controller_1.DateController().toString(),
                totalTime: 0
            }
        };
    }
    static createRunningError(name, err) {
        return RequisitionDefaultReports.createDefaultReport(name, [{
                valid: false,
                name: 'Requisition ran',
                description: err
            }]);
    }
    static createSkippedReport(name) {
        return RequisitionDefaultReports.createDefaultReport(name, [{
                valid: true,
                name: 'Requisition skipped',
                description: 'There is no iterations set to this requisition'
            }]);
    }
    static createIteratorReport(name) {
        return RequisitionDefaultReports.createDefaultReport(name + ' iterator collection');
    }
}
exports.RequisitionDefaultReports = RequisitionDefaultReports;
