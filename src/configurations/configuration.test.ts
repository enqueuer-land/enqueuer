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
        CommandLineConfiguration.getDaemonTypes.mockImplementationOnce(() => []);
    });

    it('should check \'refresh\'', () => {
        CommandLineConfiguration.getConfigFileName.mockReset();

        const reloadMock = jest.fn();
        FileConfiguration.load.mockImplementation(reloadMock);

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
        CommandLineConfiguration.getVerbosity.mockImplementationOnce(() => logLevel);

        expect(Configuration.getValues().logLevel).toBe(logLevel);
    });

    it('should check \'log-level\' in configuration file', () => {
        const logLevel = 'confFile';
        CommandLineConfiguration.getVerbosity.mockImplementation(() => {});
        FileConfiguration.getLogLevel.mockImplementationOnce(() => logLevel);

        expect(Configuration.getValues().logLevel).toBe(logLevel);
    });

    it('should check default \'log-level\'', () => {
        expect(Configuration.getValues().logLevel).toBe('warn');
    });

    it('should getOutputs in configuration file', () => {
        const outputs = 'confFile';
        FileConfiguration.getOutputs.mockImplementationOnce(() => outputs);

        expect(Configuration.getValues().outputs).toEqual([outputs]);
    });

    it('should merge getStore from configuration file and command line', () => {
        CommandLineConfiguration.getStore.mockImplementation(() => {
            return {
                commandLine: 'value'
            }
        });
        FileConfiguration.getStore.mockImplementation(() => {
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

    it('should merge plugins from configuration file, method and command line', () => {
        CommandLineConfiguration.getPlugins.mockImplementation(() => {
            return ['CommandLineConfiguration']
        });
        FileConfiguration.getPlugins.mockImplementation(() => {
            return ['FileConfiguration']
        });

        Configuration.addPlugin('ConfigurationMethod');

        expect(Configuration.getValues().plugins).toEqual(['CommandLineConfiguration', 'FileConfiguration', 'ConfigurationMethod']);
    });

    it('should check \'isQuietMode\' in command line', () => {
        const quietMode = false;
        CommandLineConfiguration.isQuietMode.mockImplementation(() => quietMode);

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
        expect(attributes.store.original).toEqual(original.original);
    });

    it('should avoid refreshing', () => {
        const filename = makeId();
        CommandLineConfiguration.getConfigFileName.mockReset();
        CommandLineConfiguration.getConfigFileName.mockImplementation(() => filename);

        const reloadMock = jest.fn();
        FileConfiguration.load.mockImplementation(reloadMock);

        Configuration.getValues();
        Configuration.getValues();
        Configuration.getValues();

        expect(reloadMock).toHaveBeenCalledTimes(1);
    });

});
