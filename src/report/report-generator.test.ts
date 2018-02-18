import {ReportGenerator} from './report-generator';
import { expect } from 'chai';
import 'mocha';

import { Report } from "./report";

describe('ReportGenerator test', function() {
    describe('generate report', function() {
        
        let reportGenerator: ReportGenerator;

        beforeEach(() => {
            reportGenerator = new ReportGenerator();
        });
        
        it('should generate report properly', function() {
            reportGenerator.addInfo("info");
            reportGenerator.addWarning("warning");
            reportGenerator.addError("error");
            const expectedReport: Report = new Report(["info"], ["warning"], ["error"]);

            const actualReport = reportGenerator.generate();

            expect(actualReport).to.deep.equals(expectedReport);
        });
    });
});
