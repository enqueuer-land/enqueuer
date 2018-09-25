import {FileConfiguration} from "./file-configuration";
import * as yaml from 'yamljs';

jest.mock('yamljs');
let fileLoadMock = jest.fn(() => true);
yaml.load.mockImplementation(fileLoadMock);

describe('FileConfiguration', () => {

    it('Reload file - success', () => {
        const filename = 'filename';

        expect(() => FileConfiguration.reload(filename)).not.toThrow();
    });

    it('Reload file - fail', () => {
        yaml.load.mockImplementation(() => {throw 'error'});

        const filename = 'filename';

        expect(() => FileConfiguration.reload(filename)).toThrow();
    });

    it('getLogLevel', () => {
        const logLevel = 'enqueuer';
        fileLoadMock = jest.fn(() => {
            return {
                'log-level': logLevel
            }
        });
        yaml.load.mockImplementation(fileLoadMock);
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
        yaml.load.mockImplementation(fileLoadMock);
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
        yaml.load.mockImplementation(fileLoadMock);
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getOutputs()).toBe(outputs);
    });

    it('getOutputs default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            }
        });
        yaml.load.mockImplementation(fileLoadMock);
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
        yaml.load.mockImplementation(fileLoadMock);
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getStore()).toBe(store);
    });

    it('getStore default', () => {
        fileLoadMock = jest.fn(() => {
            return {
            }
        });
        yaml.load.mockImplementation(fileLoadMock);
        FileConfiguration.reload('itDoesNotMatter');


        expect(FileConfiguration.getStore()).toEqual({});
    });


});
