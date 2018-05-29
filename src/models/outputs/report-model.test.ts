import {checkValidation, ReportModel} from "./report-model";

describe('ReportModel', () => {

    it('Should build properly', () => {
        const reportModel: ReportModel = {
            valid: true,
            name: "any",
            tests: {}
        }

        expect(reportModel.valid).toBeTruthy();
        expect(reportModel.name).toBe("any");
    });

    it('Should refresh valid with true', () => {
        let reportModel: ReportModel = {
            valid: true,
            name: "any",
            tests: {}
        }

        reportModel.tests["true"] = true;
        reportModel.tests["other"] = true;
        reportModel.tests["stuff"] = true;
        reportModel.tests["true"] = true;

        expect(checkValidation(reportModel)).toBeTruthy();
    });

    it('Should refresh valid with false', () => {
        let reportModel: ReportModel = {
            valid: true,
            name: "any",
            tests: {}
        }

        reportModel.tests["true"] = true;
        reportModel.tests["other"] = true;
        reportModel.tests["stuff"] = true;
        reportModel.tests["true"] = false;

        expect(checkValidation(reportModel)).toBeFalsy();
    });

});