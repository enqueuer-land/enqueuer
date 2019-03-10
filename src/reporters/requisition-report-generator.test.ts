import {RequisitionReportGenerator} from "./requisition-report-generator";

let sleep = (millisecondsToWait: number): void => {
    const waitTill = new Date(new Date().getTime() + millisecondsToWait);
    while (waitTill > new Date()) {
        //wait
    }
};

describe('RequisitionReportGenerator', () => {

    it('Create default report', () => {
        const report = new RequisitionReportGenerator({name: 'testName'}).getReport();
        expect(report.time).toBeDefined();
        delete report.time;
        expect(report).toEqual({
            "name": "testName",
            "publishers": [],
            "requisitions": [],
            "subscriptions": [],
            "tests": [],
            "valid": true
        });
    });

    it('Time report with timeout', () => {
        const timeout = 1000;
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'}, timeout);
        const firstReport = reportGenerator.getReport();
        const firstStartTime = new Date(firstReport.time.startTime.valueOf()).getTime();

        sleep(20);
        reportGenerator.finish();

        const secondReport = reportGenerator.getReport();
        expect(new Date(secondReport.time.startTime).getTime()).toBeGreaterThanOrEqual(firstStartTime);
        expect(secondReport.time.timeout).toBeGreaterThanOrEqual(timeout);
        delete secondReport.time;
        delete secondReport.tests;

        expect(secondReport).toEqual({
            "name": "someName",
            "publishers": [],
            "requisitions": [],
            "subscriptions": [],
            "valid": true
        });
    });

    it('Time out test fail', () => {
        const timeout = 10;
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'}, timeout);
        sleep(50);
        reportGenerator.finish();

        const report = reportGenerator.getReport();
        expect(report.valid).toBeFalsy();
        expect(report.tests.length).toBe(1);
        expect(report.tests[0].name).toBe('No time out');
        expect(report.tests[0].valid).toBeFalsy();
        expect(report.tests[0].description).toBeDefined();
    });

    it('Time report without timeout', () => {
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'});

        reportGenerator.finish();

        const time = reportGenerator.getReport().time;

        expect(time.startTime).toBeDefined();
        expect(time.endTime).toBeDefined();
        expect(time.totalTime).toBe(new Date(time.endTime).getTime() - new Date(time.startTime).getTime());
        expect(time.timeout).toBeUndefined();
    });

    it('Adding publisher report', () => {
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'});

        let report = reportGenerator.getReport();
        expect(report.valid).toBeTruthy();
        expect(report.publishers.length).toBe(0);

        reportGenerator.setPublishersReport([{valid: false}])
        report = reportGenerator.getReport();

        expect(report.valid).toBeFalsy();
        expect(report.publishers.length).toBe(1);
        expect(report.publishers[0].valid).toBeFalsy();
    });

    it('Adding subscription report', () => {
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'});

        let report = reportGenerator.getReport();
        expect(report.valid).toBeTruthy();
        expect(report.subscriptions.length).toBe(0);

        reportGenerator.setSubscriptionsReport([{valid: false}])
        report = reportGenerator.getReport();

        expect(report.valid).toBeFalsy();
        expect(report.subscriptions.length).toBe(1);
        expect(report.subscriptions[0].valid).toBeFalsy();
    });

    it('Adding tests', () => {
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'});

        let report = reportGenerator.getReport();
        expect(report.valid).toBeTruthy();

        reportGenerator.addTests([{valid: false}]);
        report = reportGenerator.getReport();

        expect(report.valid).toBeFalsy();
    });

    it('Adding error', () => {
        const reportGenerator = new RequisitionReportGenerator({name: 'someName'});

        let report = reportGenerator.getReport();
        expect(report.valid).toBeTruthy();

        const error = {valid: true, name: 'errorName', description: 'description'};
        reportGenerator.addError(error);
        report = reportGenerator.getReport();

        expect(report.valid).toBeFalsy();
        expect(report.tests.length).toBe(1);
        expect(report.tests[0]).toEqual({valid: false, name: 'errorName', description: 'description'});
    });


});
