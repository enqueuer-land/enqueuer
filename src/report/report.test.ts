import {ReportGenerator} from './report-generator';
import { expect } from 'chai';
import 'mocha';
import {Report} from './report'

describe('Report test', function() {
    
    it('writeToFile', () => {
        const filename: string = "fileToWrite";

        const report = new Report(["info"], ["warning"], ["error"]);
        
        // report.writeToFile(filename);
    });


});