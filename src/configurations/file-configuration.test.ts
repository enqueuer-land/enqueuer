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

    it('getDaemon RunMode', () => {
        const mode = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'run-mode': {
                    daemon: mode
                }
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getDaemon()).toBe(mode);
    });

    it('getDaemon', () => {
        const mode = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                daemon: mode
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getDaemon()).toBe(mode);
    });

    it('getSingleRun RunMode', () => {
        const mode = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'run-mode': {
                    'single-run': mode
                }
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getSingleRun()).toBe(mode);
    });

    it('getSingleRun', () => {
        const mode = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'single-run': mode
            }
        });
        FileConfiguration.load('itDoesNotMatter');

        expect(FileConfiguration.getSingleRun()).toBe(mode);
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
