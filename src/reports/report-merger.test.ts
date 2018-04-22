import {ReportMerger} from "./report-merger";

describe('ReportMerger', () => {
    it('Should be true by default', () => {
        const reportMerger: ReportMerger = new ReportMerger();
        expect(reportMerger.getReport().valid).toBeTruthy();
        expect(reportMerger.getReport().errorsDescription.length).toBe(0);
    });

    it('Should detect one error', () => {
        const reportMerger: ReportMerger = new ReportMerger();
        reportMerger.addReport({
            valid: false,
            errorsDescription: []
        })
        expect(reportMerger.getReport().valid).toBeFalsy();
        expect(reportMerger.getReport().errorsDescription.length).toBe(0);
    });

    it('Should accept report list in the constructor', () => {
        const reportMerger: ReportMerger = new ReportMerger([
            {
                valid: true,
                errorsDescription: []
            },
            {
                valid: false,
                errorsDescription: []
            },
        ]);
        expect(reportMerger.getReport().valid).toBeFalsy();
        expect(reportMerger.getReport().errorsDescription.length).toBe(0);
    });

    it('Should concat errorDescriptions', () => {
        const reportMerger: ReportMerger = new ReportMerger([
            {
                valid: true,
                name: "someName",
                errorsDescription: ["constructor"]
            }
        ]);
        reportMerger.addReport({
            valid: true,
            errorsDescription: ["firstMethod"]
        });
        reportMerger.addReport({
            valid: true,
            id: "someId",
            errorsDescription: ["secondMethod"]
        });
        expect(reportMerger.getReport().valid).toBeTruthy();
        expect(reportMerger.getReport().errorsDescription)
                                        .toEqual([
                                            "[someName]constructor",
                                            "[1]firstMethod",
                                            "[someId]secondMethod"]);
    });
});