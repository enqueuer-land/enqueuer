import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';
import {SummaryTestOutput} from './outputs/summary-test-output';

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
    });

    it('should call configuration methods', () => {

        const enqueuerRunner = new EnqueuerRunner();

        expect(configurationMethodsMock.isParallel).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getFiles).toHaveBeenCalledTimes(1);
    });

    it('should add every matching file', () => {
        const enqueuerRunner = new EnqueuerRunner();

        expect(enqueuerRunner.getFilesName()).toEqual([
            'src/enqueuer-runner.test.ts',
            'src/enqueuer-runner.ts',
            'src/enqueuer-starter.test.ts',
            'src/enqueuer-starter.ts',
            'src/index.ts',
        ]);
    });

    it('should add every not matching file to error', () => {
        const enqueuerRunner = new EnqueuerRunner();

        expect(enqueuerRunner.getFilesErrors().sort()).toEqual([{
            'description': 'No file was found with: \'not-matching-pattern\'',
            'name': 'No file was found with: \'not-matching-pattern\'',
            'valid': false,
        }, {
            'description': 'File pattern is not a string: \'true\'',
            'name': 'File pattern is not a string: \'true\'',
            'valid': false,
        }].sort());
    });

    it('should add error when no test is found', async () => {
        configurationMethodsMock = {
            isParallel: () => true,
            getFiles: () => ['not-matching-pattern'],
            getMaxReportLevelPrint: jest.fn(),
            getOutputs: jest.fn(() => [])
        };

        expect(await new EnqueuerRunner().execute()).toBeFalsy();
        expect(configurationMethodsMock.getMaxReportLevelPrint).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
        expect(summaryTestsMethodsMock.print).toHaveBeenCalledTimes(1);
        const summaryTestsConstructorArgs = summaryTestsMock.mock.calls[0][0];
        expect(summaryTestsConstructorArgs.valid).toBeFalsy();
        expect(summaryTestsConstructorArgs.tests[0].description).toContain('not-matching-pattern');
    });

});
