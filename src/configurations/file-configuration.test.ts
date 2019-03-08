import {FileConfiguration} from './file-configuration';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';

jest.mock('../object-notations/multiple-object-notation');
let fileLoadMock = jest.fn(() => true);

describe('FileConfiguration', () => {
    beforeEach(() => {
        // @ts-ignore
        MultipleObjectNotation.mockImplementationOnce(() => {
            return {
                loadFromFileSync: fileLoadMock
            };
        });

    });

    afterEach(() => {
        fileLoadMock.mockClear();
        // @ts-ignore
        MultipleObjectNotation.mockClear();
    });

    it('Reload file - success', () => {
        const filename = 'filename';

        expect(() => new FileConfiguration(filename)).not.toThrow();
    });

    it('Reload file - fail', () => {
        fileLoadMock.mockImplementation(() => {throw 'error';});

        const filename = 'filename';

        expect(() => new FileConfiguration(filename)).toThrow();
    });

    it('getVerbosity', () => {
        const logLevel = 'enqueuer';
        fileLoadMock.mockImplementation(() => {
            return {
                'log-level': logLevel
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getLogLevel()).toBe(logLevel);
    });

    it('getOutputs', () => {
        const outputs = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'outputs': outputs
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getOutputs()).toBe(outputs);
    });

    it('name; parallel; files, maxReportLevelPrint', () => {
        fileLoadMock = jest.fn(() => {
            return {
                'name': 'enqueuer',
                'parallel': true,
                'files': ['1', '2'],
                maxReportLevelPrint: 10
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getName()).toBe('enqueuer');
        expect(fileConfiguration.isParallelExecution()).toBeTruthy();
        expect(fileConfiguration.getFiles()).toEqual(['1', '2']);
        expect(fileConfiguration.getMaxReportLevelPrint()).toEqual(10);
    });

    it('getPlugins', () => {
        const pluginsList = ['plugin1', 'plugin2'];
        fileLoadMock = jest.fn(() => {
            return {
                'plugins': pluginsList
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getPlugins()).toBe(pluginsList);
    });

    it('getOutputs default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getOutputs()).toBeUndefined();
    });

    it('getStore', () => {
        const store = {
            key: 'value',
            otherKey: 123
        };
        fileLoadMock = jest.fn(() => {
            return {
                'store': store
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getStore()).toBe(store);
    });

    it('getStore default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getStore()).toBeUndefined();
    });

});
