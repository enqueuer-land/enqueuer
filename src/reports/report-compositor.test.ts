import {ReportCompositor} from "./report-compositor";
import {Report} from "./report";

describe('ReportCompositor', () => {
    it('Should be true by default', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        const snapshot = reportCompositor.snapshot();
        expect(snapshot.valid).toBeTruthy();
        expect(snapshot.name).toBe("name");
        expect(snapshot.errors).toBeUndefined();
        expect(snapshot.success).toBeUndefined();
    });

    it('Should detect one error', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor.addSubReport(Report.create("someName", {valid:false}));
        const snapshot = reportCompositor.snapshot();
        expect(snapshot.valid).toBeFalsy();
        expect(snapshot.errors).toBeUndefined();
        expect(snapshot.success).toBeUndefined();
    });

    it('Should keep report additional info', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor.addInfo({additionalInfo: "added"});
        const snapshot = reportCompositor.snapshot();
        expect(snapshot.valid).toBeTruthy();
        expect(snapshot.additionalInfo).toBeDefined();
    });

    it('Should merge reports', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name").addInfo({extra: "extra"}).addTest("valid", true);
        reportCompositor.mergeReport(
                            Report.create("ignored",
                        {
                                valid: false,
                                tests: [{name: "oneError", valid: false}, {name: "oneSuccess", valid: true}],
                                additionalInfo: "add"
                                }));
        const snapshot = reportCompositor.snapshot();

        expect(snapshot.valid).toBeFalsy();
        expect(snapshot.name).toBe("name");
        expect(snapshot.extra).toBe("extra");
        expect(snapshot.tests).toEqual([{name: "valid", valid: true},
                                                {name: "oneError", valid: false},
                                                {name: "oneSuccess", valid: true}]);
        expect(snapshot.additionalInfo).toBe("add");
    });

    it('Should compose reports', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor
            .addInfo({additionalInfo: "added"})
            .addSubReport(Report.create("someId",
                {
                        tests: [{name: "oneSuccess", valid: true}]
                }))
            .addSubReport(Report.create("someOther",
                {
                        tests: [{name: "twoSuccess", valid: true}]
                }))
            .addSubReport(Report.create("someName",
                {
                        valid: false,
                        tests: [{name: "threeSuccess", valid: true}, {name: "failure", valid: false}],
                        value: "random"
                }));

        const expected = {
            "additionalInfo": "added",
            "name": "name",
            "someId": {
                tests: [{name: "oneSuccess", valid: true}],
                "valid": true,
            },
            "someName": {
                valid: false,
                tests: [{name: "threeSuccess", valid: true}, {name: "failure", valid: false}],
                value: "random"
            },
            "someOther": {
                tests: [{name: "twoSuccess", valid: true}],
                "valid": true
            },
            "valid": false
        }

        expect(reportCompositor.snapshot()).toEqual(expected);
    });
});