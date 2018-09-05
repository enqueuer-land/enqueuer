import {Configuration} from "./configuration";
import {FileConfiguration} from "./file-configuration";
import {CommandLineConfiguration} from "./command-line-configuration";

jest.mock('./file-configuration');
jest.mock('./command-line-configuration');

describe('Configuration', () => {

    const makeId = () => {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };

    beforeEach(() => {
        CommandLineConfiguration.getConfigFileName.mockImplementationOnce(() => makeId());
    });

    it('should check \'refresh\'', () => {
        CommandLineConfiguration.getConfigFileName.mockReset();

        const reloadMock = jest.fn();
        FileConfiguration.reload.mockImplementation(reloadMock);
        
        let configFileName = 'first';
        CommandLineConfiguration.getConfigFileName.mockImplementationOnce(() => configFileName);
        
        Configuration.getValues();
        
        expect(reloadMock).toHaveBeenCalledWith(configFileName);
        
        //----

        configFileName = 'second';
        CommandLineConfiguration.getConfigFileName.mockImplementationOnce(() => configFileName);

        Configuration.getValues();
        
        
        expect(reloadMock).toHaveBeenCalledWith(configFileName);
    });

    it('should check \'LogLevel\' in command line', () => {
        const logLevel = 'commandLine';
        CommandLineConfiguration.getLogLevel.mockImplementationOnce(() => logLevel);

        expect(Configuration.getValues().logLevel).toBe(logLevel);
    });

    it('should check \'log-level\' in configuration file', () => {
        const logLevel = 'confFile';
        CommandLineConfiguration.getLogLevel.mockImplementation(() => {});
        FileConfiguration.getLogLevel.mockImplementationOnce(() => logLevel);

        expect(Configuration.getValues().logLevel).toBe(logLevel);
    });

    it('should check default \'log-level\'', () => {
        expect(Configuration.getValues().logLevel).toBe('warn');
    });

    it('should getRunMode in configuration file', () => {
        const runMode = 'confFile';
        FileConfiguration.getRunMode.mockImplementationOnce(() => runMode);

        expect(Configuration.getValues().runMode).toBe(runMode);
    });

    it('should getOutputs in configuration file', () => {
        const outputs = 'confFile';
        FileConfiguration.getOutputs.mockImplementationOnce(() => outputs);

        expect(Configuration.getValues().outputs).toBe(outputs);
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

        expect(Configuration.getValues().store).toEqual(expected);
    });

    it('should check \'isQuietMode\' in command line', () => {
        const quietMode = false;
        CommandLineConfiguration.isQuietMode.mockImplementationOnce(() => quietMode);

        expect(Configuration.getValues().quiet).toBe(quietMode);
    });

    it('should clone original value', () => {
        CommandLineConfiguration.getConfigFileName.mockReset();
        CommandLineConfiguration.getConfigFileName.mockImplementation(() => 'file');

        const original = {original: true};
        const changed = {changed: true};
        CommandLineConfiguration.getStore.mockImplementation(() => {return original});

        const previousValue = Configuration.getValues();
        previousValue.store = changed;

        const attributes = Configuration.getValues();

        expect(previousValue.store).toEqual(changed);
        expect(attributes.store).toEqual(original);
    });

    it('should avoid refreshing', () => {
        const filename = makeId();
        CommandLineConfiguration.getConfigFileName.mockReset();
        CommandLineConfiguration.getConfigFileName.mockImplementation(() => filename);

        const reloadMock = jest.fn();
        FileConfiguration.reload.mockImplementation(reloadMock);

        Configuration.getValues();
        Configuration.getValues();
        Configuration.getValues();

        expect(reloadMock).toHaveBeenCalledTimes(1);
    });

});