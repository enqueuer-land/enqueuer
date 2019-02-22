import {FileConfiguration} from "./file-configuration";
import {MultipleObjectNotation} from "../object-notations/multiple-object-notation";

jest.mock('../object-notations/multiple-object-notation');
let fileLoadMock = jest.fn(() => true);

describe('FileConfiguration', () => {
    beforeEach(() => {
        MultipleObjectNotation.mockImplementationOnce(() => {
            return {
                loadFromFileSync: fileLoadMock
            }
        });

    });

    afterEach(() => {
        fileLoadMock.mockClear();
        MultipleObjectNotation.mockClear();
    });

    it('Reload file - success', () => {
        const filename = 'filename';

        expect(() => FileConfiguration.load(filename)).not.toThrow();
    });

    it('Reload file - fail', () => {
        fileLoadMock.mockImplementation(() => {throw 'error'});

        const filename = 'filename';

        expect(() => FileConfiguration.load(filename)).toThrow();
    });

    it('getVerbosity', () => {
        const logLevel = 'enqueuer';
        fileLoadMock.mockImplementation(() => {
            return {
                'log-level': logLevel
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getLogLevel()).toBe(logLevel);
    });

    it('getOutputs', () => {
        const outputs = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'outputs': outputs
            }
        });
        FileConfiguration.load('itDoesNotMatter');


        expect(FileConfiguration.getOutputs()).toBe(outputs);
    });

    it('name; parallel; files', () => {
        fileLoadMock = jest.fn(() => {
            return {
                'name': 'enqueuer',
                'parallel': true,
                'files': ['1', '2']
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getName()).toBe('enqueuer');
        expect(FileConfiguration.isParallelExecution()).toBeTruthy();
        expect(FileConfiguration.getFiles()).toEqual(['1', '2']);
    });

    it('getPlugins', () => {
        const pluginsList = ['plugin1', 'plugin2'];
        fileLoadMock = jest.fn(() => {
            return {
                'plugins': pluginsList
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getPlugins()).toBe(pluginsList);
    });

    it('getOutputs default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            }
        });
        FileConfiguration.load('itDoesNotMatter');


        expect(FileConfiguration.getOutputs()).toBeUndefined();
    });

    it('getStore', () => {
        const store = {
            key: 'value',
            otherKey: 123
        };
        fileLoadMock = jest.fn(() => {
            return {
                'store': store
            }
        });
        FileConfiguration.load('itDoesNotMatter');


        expect(FileConfiguration.getStore()).toBe(store);
    });

    it('getStore default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            }
        });
        FileConfiguration.load('itDoesNotMatter');


        expect(FileConfiguration.getStore()).toBeUndefined()
    });


});
