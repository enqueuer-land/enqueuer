import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';
import {SummaryTestOutput} from './outputs/summary-test-output';
import {RequisitionFileParser} from './requisition-runners/requisition-file-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';

jest.mock('./outputs/summary-test-output');
jest.mock('./configurations/configuration');
jest.mock('./requisition-runners/requisition-file-parser');
jest.mock('./requisition-runners/requisition-runner');

describe('EnqueuerRunner', () => {
    let configurationMethodsMock: any;
    let summaryTestsMock: any;
    let summaryTestsMethodsMock: any;
    let parsedRequisitions = [{name: 'I am fake'}];
    let requisitionRunnerMethods = {
        run: jest.fn(async () => {
            return {
                name: 'mocked report',
                valid: true
            };
        })
    };

    let requisitionRunnerMock = jest.fn(() => requisitionRunnerMethods);

    let parallel = true;
    beforeEach(() => {
        configurationMethodsMock = {
            isParallel: jest.fn(() => parallel),
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
                parse: () => parsedRequisitions,
                getFilesErrors: () => []
            };
        });

        // @ts-ignore
        RequisitionRunner.mockImplementationOnce(requisitionRunnerMock);
        requisitionRunnerMethods.run.mockClear();
        requisitionRunnerMock.mockClear();
    });

    it('should call configuration methods once', async () => {

        await new EnqueuerRunner().execute();

        expect(configurationMethodsMock.isParallel).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getMaxReportLevelPrint).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getFiles).toHaveBeenCalledTimes(1);
    });

    it('should call requisition runner parallel', async () => {
        await new EnqueuerRunner().execute();

        expect(requisitionRunnerMethods.run).toHaveBeenCalledTimes(1);
        expect(requisitionRunnerMock).toHaveBeenCalledTimes(1);
        const actualReport = summaryTestsMock.mock.calls[0][0];
        expect(actualReport.name).toBe('enqueuer');
        expect(actualReport.time.startTime).toBeDefined();
        expect(actualReport.time.endTime).toBeDefined();
        const totalTime = new Date(actualReport.time.endTime).getTime() - new Date(actualReport.time.startTime).getTime();
        expect(actualReport.time.totalTime).toBe(totalTime);
        expect(actualReport.requisitions).toEqual([{
            name: 'mocked report',
            valid: true
        }]);
    });

    it('should call requisition runner not parallel', async () => {
        parallel = false;
        await new EnqueuerRunner().execute();

        expect(requisitionRunnerMethods.run).toHaveBeenCalledTimes(1);
        expect(requisitionRunnerMock).toHaveBeenCalledTimes(1);
        const actualReport = summaryTestsMock.mock.calls[0][0];
        expect(actualReport.name).toBe('enqueuer');
        expect(actualReport.time.startTime).toBeDefined();
        expect(actualReport.time.endTime).toBeDefined();
        const totalTime = new Date(actualReport.time.endTime).getTime() - new Date(actualReport.time.startTime).getTime();
        expect(actualReport.time.totalTime).toBe(totalTime);
        expect(actualReport.requisitions).toEqual([{
            name: 'mocked report',
            valid: true
        }]);
    });

});
