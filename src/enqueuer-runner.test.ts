import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';
import {SummaryTestOutput} from './outputs/summary-test-output';
import {RequisitionFileParser} from './requisition-runners/requisition-file-parser';

jest.mock('./outputs/summary-test-output');
jest.mock('./configurations/configuration');
jest.mock('./requisition-runners/requisition-file-parser');

describe('EnqueuerRunner', () => {
    let configurationMethodsMock: any;
    let summaryTestsMock: any;
    let summaryTestsMethodsMock: any;

    beforeEach(() => {
        configurationMethodsMock = {
            isParallel: jest.fn(),
            getMaxReportLevelPrint: jest.fn(),
            getOutputs: jest.fn(),
            getFiles: jest.fn(() => ['src/*.ts', 'not-matching-pattern', true]),
        };
        // @ts-ignore
        Configuration.getInstance.mockImplementation(() => configurationMethodsMock);

        summaryTestsMethodsMock = {
            print: jest.fn()
        };
        summaryTestsMock = jest.fn(() => summaryTestsMethodsMock);
        // @ts-ignore
        SummaryTestOutput.mockImplementation(summaryTestsMock);

        // @ts-ignore
        RequisitionFileParser.mockImplementationOnce(() => {
            return {
                parse: () => [],
                getFilesErrors: () => []
            };
        });
    });

    it('should call configuration methods once', async () => {

        await new EnqueuerRunner().execute();

        expect(configurationMethodsMock.isParallel).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getMaxReportLevelPrint).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getFiles).toHaveBeenCalledTimes(1);
    });

});
