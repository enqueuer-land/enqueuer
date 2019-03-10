import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';

jest.mock('./configurations/configuration');

describe('EnqueuerRunner', () => {
    let configurationMethodsMock: any;

    beforeEach(() => {
        configurationMethodsMock = {
            getName: jest.fn(),
            isParallel: jest.fn(),
            getFiles: jest.fn(() => [])
        };
        // @ts-ignore
        Configuration.getInstance.mockImplementationOnce(() => configurationMethodsMock);
    });

    it('should call configuration methods', () => {

        const enqueuerRunner = new EnqueuerRunner();

        expect(configurationMethodsMock.getName).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.isParallel).toHaveBeenCalledTimes(1);
        expect(configurationMethodsMock.getFiles).toHaveBeenCalledTimes(1);
    });
});
