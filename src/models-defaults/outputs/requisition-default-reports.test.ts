import {RequisitionDefaultReports} from "./requisition-default-reports";

describe('RequisitionDefaultReports', () => {
    it('createIteratorReport', () => {
        const report = RequisitionDefaultReports.createIteratorReport('g');
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            "name": "g iterator collection",
            "startEvent": {},
            "subscriptions": [],
            "tests": [],
            "valid": true
        });
    });

    it('createRunningError', () => {
        const report = RequisitionDefaultReports.createRunningError('lopidio', 'err');
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            "name": "lopidio",
            "startEvent": {},
            "subscriptions": [],
            "tests": [{"description": 'err', "name": "Requisition ran", "valid": false}],
            "valid": false
        });
    });

    it('createSkippedReport', () => {
        const report = RequisitionDefaultReports.createSkippedReport('virgs');
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
                "name": "virgs",
                "startEvent": {},
                "subscriptions": [],
                "tests": [{
                    "description": "There is no iterations set to this requisition",
                    "name": "Requisition skipped",
                    "valid": true
                }],
                "valid": true
            }
        );
    });
});