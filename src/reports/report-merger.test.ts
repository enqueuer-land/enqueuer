import {ReportMerger} from "./report-merger";

describe('ReportMerger', () => {
    it('Should be true by default', () => {
        const reportMerger: ReportMerger = new ReportMerger("prefix");
        expect(reportMerger.getReport().valid).toBeTruthy();
        expect(reportMerger.getReport().errorsDescription.length).toBe(0);
    });

    it('Should detect one error', () => {
        const reportMerger: ReportMerger = new ReportMerger("prefix");
        reportMerger.addReport({
            valid: false,
            name: "someName",
            errorsDescription: []
        })
        expect(reportMerger.getReport().valid).toBeFalsy();
        expect(reportMerger.getReport().errorsDescription.length).toBe(0);
    });

    it('Should accept report list in the constructor', () => {
        const reportMerger: ReportMerger = new ReportMerger("prefix", [
            {
                valid: true,
                name: "someName",
                errorsDescription: []
            },
            {
                valid: false,
                name: "someName",
                errorsDescription: []
            },
        ]);
        expect(reportMerger.getReport().valid).toBeFalsy();
        expect(reportMerger.getReport().errorsDescription.length).toBe(0);
    });

    it('Should keep report additional info', () => {
        const reportMerger: ReportMerger = new ReportMerger("prefix", [
            {
                valid: true,
                errorsDescription: [],
                additionalInfo: "added",
                name: "name"
            },
        ]);
        expect(reportMerger.getReport().valid).toBeTruthy();
        expect(reportMerger.getReport()).toEqual(
    {
                errorsDescription: [],
                name: {
                    additionalInfo: "added",
                    errorsDescription: [],
                    name: "name",
                    valid: true
                },
                valid: true
             });
    });

    it('Should concat errorDescriptions', () => {
        const reportMerger: ReportMerger = new ReportMerger("prefix", [
            {
                valid: true,
                name: "someName",
                errorsDescription: ["constructor"]
            }
        ]);
        reportMerger.addReport({
            valid: true,
            name: "someOther",
            errorsDescription: ["firstMethod"]
        });
        reportMerger.addReport({
            valid: true,
            name: "someId",
            errorsDescription: ["secondMethod"]
        });
        expect(reportMerger.getReport().valid).toBeTruthy();
        expect(reportMerger.getReport().errorsDescription)
                                        .toEqual(
                                    ["[prefix][someName]constructor",
                                            "[prefix][someOther]firstMethod",
                                            "[prefix][someId]secondMethod"]);
    });
});