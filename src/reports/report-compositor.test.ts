import {ReportCompositor} from "./report-compositor";
import {Report} from "./report";

describe('ReportCompositor', () => {
    it('Should be true by default', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        const snapshot = reportCompositor.snapshot();
        expect(snapshot.valid).toBeTruthy();
        expect(snapshot.tests).toBeUndefined();
    });

    it('Should detect one error', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor.addSubReport(Report.create("someName", {valid:false}));
        const snapshot = reportCompositor.snapshot();
        expect(snapshot.valid).toBeFalsy();
        expect(snapshot.tests).toBeUndefined();
    });

    it('Should keep report additional info', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor.addInfo({additionalInfo: "added"});
        const snapshot = reportCompositor.snapshot();
        expect(snapshot.valid).toBeTruthy();
        expect(snapshot.additionalInfo).toBeDefined();
    });

    it('Should compose reports', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor
            .addInfo({additionalInfo: "added"})
            .addSubReport(Report.create("someId",
                {
                        tests: [{"oneSuccess": true}]
                }))
            .addSubReport(Report.create("someOther",
                {
                        tests: [{"twoSuccess": true}]
                }))
            .addSubReport(Report.create("someName",
                {
                        valid: false,
                        tests: [{"threeSuccess": true}, {"failure": false}],
                        value: "random"
                }));

        const expected = {
            "additionalInfo": "added",
            "name": "name",
            "someId": {
                tests: [{"oneSuccess": true}],
                "valid": true,
            },
            "someName": {
                valid: false,
                tests: [{"threeSuccess": true}, {"failure": false}],
                value: "random"
            },
            "someOther": {
                tests: [{"twoSuccess": true}],
                "valid": true
            },
            "valid": false
        }

        expect(reportCompositor.snapshot()).toEqual(expected);
    });
});