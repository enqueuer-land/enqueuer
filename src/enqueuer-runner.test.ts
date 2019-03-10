import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';
import {RequisitionFileParser} from './requisition-runners/requisition-file-parser';

jest.mock('./configurations/configuration');
jest.mock('./requisition-runners/requisition-file-parser');

describe('EnqueuerRunner', () => {
    let configurationMethodsMock: any;

    beforeEach(() => {
        configurationMethodsMock = {
            getName: jest.fn(),
            isParallel: jest.fn(),
            getFiles: jest.fn(() => ['src/*.ts', 'not-matching-pattern', true]),
        };
        // @ts-ignore
        Configuration.getInstance.mockImplementation(() => configurationMethodsMock);
    });

    it('should call configuration methods', () => {

        const enqueuerRunner = new EnqueuerRunner();

        expect(configurationMethodsMock.getName).toHaveBeenCalledTimes(1);
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
            'description': 'No file was found with: not-matching-pattern',
            'name': 'File found with not-matching-pattern',
            'valid': false,
        }, {
            'description': 'File pattern is not a string: true',
            'name': 'true is a string',
            'valid': false,
        }].sort());
    });

    it('should add error when no test is found', async done => {
        configurationMethodsMock = {
            getName: () => '',
            isParallel: () => true,
            getFiles: () => ['not-matching-pattern'],
            getMaxReportLevelPrint: jest.fn(),
            getOutputs: jest.fn(() => [])
        };

        try {
            await new EnqueuerRunner().execute();
        } catch (err) {
            expect(err).toBeDefined();
            expect(configurationMethodsMock.getMaxReportLevelPrint).toHaveBeenCalledTimes(1);
            expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
            done();
        }
    });

    it('should not print summary when is not parallel', async done => {
        configurationMethodsMock = {
            getName: () => '',
            isParallel: () => false,
            getFiles: () => ['not-matching-pattern'],
            getMaxReportLevelPrint: jest.fn(),
            getOutputs: jest.fn(() => [])
        };

        try {
            await new EnqueuerRunner().execute();
        } catch (err) {
            expect(err).toBeDefined();
            expect(configurationMethodsMock.getMaxReportLevelPrint).not.toHaveBeenCalled();
            done();
        }
    });
});
