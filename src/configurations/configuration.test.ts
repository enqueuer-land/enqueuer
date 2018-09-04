import {Configuration} from "./configuration";
import {FileConfiguration} from "./file-configuration";
import {CommandLineConfiguration} from "./command-line-configuration";

jest.mock('./file-configuration');
jest.mock('./command-line-configuration');

describe('Configuration', () => {

    it('should check \'refresh\'', () => {
        const reloadMock = jest.fn();
        FileConfiguration.reload.mockImplementation(reloadMock);

        let configFileName = 'first';
        CommandLineConfiguration.getConfigFileName.mockImplementationOnce(() => configFileName);


        new Configuration().getLogLevel();

        expect(reloadMock).toHaveBeenCalledWith(configFileName);

        //----

        configFileName = 'second';
        CommandLineConfiguration.getConfigFileName.mockImplementationOnce(() => configFileName);

        new Configuration().getLogLevel();


        expect(reloadMock).toHaveBeenCalledWith(configFileName);
    });

    it('should check \'LogLevel\' in command line', () => {
        const logLevel = 'commandLine';
        CommandLineConfiguration.getLogLevel.mockImplementationOnce(() => logLevel);

        expect(new Configuration().getLogLevel()).toBe(logLevel);
    });

    it('should check \'log-level\' in configuration file', () => {
        const logLevel = 'confFile';
        FileConfiguration.getLogLevel.mockImplementationOnce(() => logLevel);

        expect(new Configuration().getLogLevel()).toBe(logLevel);
    });

    it('should check default \'log-level\'', () => {
        expect(new Configuration().getLogLevel()).toBe('warn');
    });

    it('should getRunMode in configuration file', () => {
        const runMode = 'confFile';
        FileConfiguration.getRunMode.mockImplementationOnce(() => runMode);

        expect(new Configuration().getRunMode()).toBe(runMode);
    });

    it('should getOutputs in configuration file', () => {
        const outputs = 'confFile';
        FileConfiguration.getOutputs.mockImplementationOnce(() => outputs);

        expect(new Configuration().getOutputs()).toBe(outputs);
    });

    it('should merge getStore from configuration file and command line', () => {
        CommandLineConfiguration.getStore.mockImplementationOnce(() => {
            return {
                commandLine: 'value'
            }
        });
        FileConfiguration.getStore.mockImplementationOnce(() => {
            return {
                confFile: 'value'
            }
        });

        const expected = {
            commandLine: 'value',
            confFile: 'value'
        };

        expect(new Configuration().getStore()).toEqual(expected);
    });

    it('should check \'isQuietMode\' in command line', () => {
        const quietMode = false;
        CommandLineConfiguration.isQuietMode.mockImplementationOnce(() => quietMode);

        expect(new Configuration().isQuietMode()).toBe(quietMode);
    });

});