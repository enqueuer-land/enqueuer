import {FileConfiguration} from "./file-configuration";
import {MultipleObjectNotation} from "../object-notations/multiple-object-notation";
import * as yaml from 'yamljs';

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

        expect(() => FileConfiguration.reload(filename)).not.toThrow();
    });

    it('Reload file - fail', () => {
        fileLoadMock.mockImplementation(() => {throw 'error'});

        const filename = 'filename';

        expect(() => FileConfiguration.reload(filename)).toThrow();
    });

    it('getVerbosity', () => {
        const logLevel = 'enqueuer';
        fileLoadMock.mockImplementation(() => {
            return {
                'log-level': logLevel
            }
        });
        FileConfiguration.reload('itDoesNotMatter');

        expect(FileConfiguration.getLogLevel()).toBe(logLevel);
    });

    it('getRunMode', () => {
        const runMode = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'run-mode': runMode
            }
        });
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getRunMode()).toBe(runMode);
    });

    it('getOutputs', () => {
        const outputs = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'outputs': outputs
            }
        });
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getOutputs()).toBe(outputs);
    });

    it('getOutputs default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            }
        });
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getOutputs()).toEqual([]);
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
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getStore()).toBe(store);
    });

    it('getStore default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            }
        });
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getStore()).toEqual({});
    });


});
