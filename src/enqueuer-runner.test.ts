import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';
import {RequisitionFilesParser} from './requisition-runners/requisition-files-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';

jest.mock('./configurations/configuration');
jest.mock('./requisition-runners/requisition-files-parser');
jest.mock('./requisition-runners/requisition-runner');

describe('EnqueuerRunner', () => {
    let configurationMethodsMock: any;
    let parsedRequisitions = [{name: 'I am fake'}];
    let requisitionRunnerMethods = {
        run: jest.fn(async () => {
            return [{
                name: 'mocked report',
                valid: true
            }];
        })
    };

    let requisitionRunnerMock = jest.fn(() => requisitionRunnerMethods);

    let parallel = true;
    beforeEach(() => {
        configurationMethodsMock = {
            isParallel: jest.fn(() => parallel),
            getOutputs: jest.fn(),
            getFiles: jest.fn(() => ['src/*.ts', 'not-matching-pattern', true]),
        };
        // @ts-ignore
        Configuration.getInstance.mockImplementation(() => configurationMethodsMock);

        // @ts-ignore
        RequisitionFilesParser.mockImplementationOnce(() => {
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
        expect(configurationMethodsMock.getFiles).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getOutputs).toHaveBeenCalledTimes(1);
    });

});
