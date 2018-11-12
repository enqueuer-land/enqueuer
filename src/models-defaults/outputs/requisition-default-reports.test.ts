import {RequisitionDefaultReports} from "./requisition-default-reports";

describe('RequisitionDefaultReports', () => {
    it('default', () => {
        const report = RequisitionDefaultReports.createDefaultReport({name: 'g',  id: 'id'});
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            "name": "g",
            id: "id",
            publishers: [],
            "subscriptions": [],
            "tests": [],
            "valid": true,
            requisitions: []
        });
    });

    it('createIteratorReport', () => {
        const report = RequisitionDefaultReports.createIteratorReport({name: 'g'});
        expect(report.id).toBeUndefined();
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            "name": "g iterator collection",
            publishers: [],
            "subscriptions": [],
            "tests": [],
            "valid": true,
            requisitions: []
        });
    });

    it('createRunningError', () => {
        const report = RequisitionDefaultReports.createRunningError({name: 'lopidio'}, 'err');
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBeLessThan(1000);
        delete report.time;
        expect(report).toEqual({
            "name": "lopidio",
            publishers: [],
            "subscriptions": [],
            "tests": [{"description": 'err', "name": "Requisition ran", "valid": false}],
            "valid": false,
            requisitions: []
        });
    });

    it('createSkippedReport', () => {
        const report = RequisitionDefaultReports.createSkippedReport({name: 'virgs'});
        expect(report.time.startTime).toBeDefined();
        expect(report.time.endTime).toBeDefined();
        expect(report.time.totalTime).toBe(0);
        delete report.time;
        expect(report).toEqual({
                "name": "virgs",
                publishers: [],
                "subscriptions": [],
                "tests": [{
                    "description": "There is no iterations set to this requisition",
                    "name": "Requisition skipped",
                    "valid": true
                }],
                "valid": true,
                requisitions: []
            }
        );
    });
});
