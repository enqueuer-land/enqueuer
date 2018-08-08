import {checkValidation, ReportModel} from "./report-model";

describe('ReportModel', () => {

    it('Should build properly', () => {
        const reportModel: ReportModel = {
            valid: true,
            name: "any",
            tests: []
        }

        expect(reportModel.valid).toBeTruthy();
        expect(reportModel.name).toBe("any");
    });

    it('Should refresh valid with true', () => {
        let reportModel: ReportModel = {
            valid: true,
            name: "any",
            tests: []
        }

        reportModel.tests.push({valid: true, name: "any", description: "any"});
        reportModel.tests.push({valid: true, name: "any", description: "any"});
        reportModel.tests.push({valid: true, name: "any", description: "any"});

        expect(checkValidation(reportModel)).toBeTruthy();
    });

    it('Should refresh valid with false', () => {
        let reportModel: ReportModel = {
            valid: true,
            name: "any",
            tests: []
        }

        reportModel.tests.push({valid: true, name: "any", description: "any"});
        reportModel.tests.push({valid: true, name: "any", description: "any"});
        reportModel.tests.push({valid: true, name: "any", description: "any"});
        reportModel.tests.push({valid: false, name: "any", description: "any"});

        expect(checkValidation(reportModel)).toBeFalsy();
    });

});