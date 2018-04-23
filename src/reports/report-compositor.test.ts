import {ReportCompositor} from "./report-compositor";

describe('ReportCompositor', () => {
    it('Should be true by default', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        expect(reportCompositor.snapshot().valid).toBeTruthy();
        expect(reportCompositor.snapshot().name).toBe("name");
        expect(reportCompositor.snapshot().errorsDescription.length).toBe(0);
    });

    it('Should detect one error', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor.addSubReport({name: "someName", valid:false, errorsDescription: []});
        expect(reportCompositor.snapshot().valid).toBeFalsy();
        expect(reportCompositor.snapshot().errorsDescription.length).toBe(0);
    });

    it('Should keep report additional info', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor.addInfo({additionalInfo: "added"});
        expect(reportCompositor.snapshot().valid).toBeTruthy();
        expect(reportCompositor.snapshot().additionalInfo).toBeDefined();
    })

    it('Should merge reports', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name").addInfo({extra: "extra"});
        reportCompositor.mergeReport(
            {
                            valid: false,
                            errorsDescription: ["oneError"],
                            name: "ignored",
                            additionalInfo: "add"
                        });
        expect(reportCompositor.snapshot().valid).toBeFalsy();
        expect(reportCompositor.snapshot().errorsDescription).toEqual(["oneError"]);
        expect(reportCompositor.snapshot().name).toBe("name");
        expect(reportCompositor.snapshot().extra).toBe("extra");
        expect(reportCompositor.snapshot().additionalInfo).toBe("add");
    })

    it('Should compose reports', () => {
        const reportCompositor: ReportCompositor = new ReportCompositor("name");
        reportCompositor
            .addInfo({additionalInfo: "added"})
            .addSubReport({
                valid: true,
                name: "someName",
                errorsDescription: ["firstError", "secondError"]})
            .addSubReport({
                valid: true,
                name: "someOther",
                errorsDescription: ["firstMethod"]})
            .addSubReport({
                valid: true,
                name: "someId",
                value: "random",
                errorsDescription: ["secondMethod"]});

        const expected = {
            additionalInfo: "added",
            errorsDescription: [
                "[someName]firstError",
                "[someName]secondError",
                "[someOther]firstMethod",
                "[someId]secondMethod"
            ],
            name: "name",
            someId: {
                errorsDescription: ["secondMethod"],
                name: "someId",
                value: "random",
                valid: true
            },
            someName: {
                errorsDescription: ["firstError", "secondError"],
                name: "someName",
                valid: true
            },
            someOther: {
                errorsDescription: ["firstMethod"],
                name: "someOther",
                valid: true
            },
            valid: false
        }
        expect(reportCompositor.snapshot()).toEqual(expected);
    });
});