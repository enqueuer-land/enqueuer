import { CommandLineConfiguration } from './command-line-configuration';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';

const consoleLogMock = jest.fn(message => console.warn(message));
console.log = consoleLogMock;

jest.mock('../plugins/dynamic-modules-manager');

const describeProtocolsMock = jest.fn(() => true);
const describeReportFormattersMock = jest.fn(() => true);
const describeObjectParsersMock = jest.fn(() => false);
const describeAssertersMock = jest.fn(() => false);
const describeLoadedModulesMock = jest.fn(() => false);
// @ts-ignore
DynamicModulesManager.getInstance.mockImplementation(() => ({
    getProtocolManager: () => {
        return {
            describeMatchingProtocols: describeProtocolsMock
        };
    },
    getReportFormatterManager: () => {
        return {
            describeMatchingReportFormatters: describeReportFormattersMock
        };
    },
    getObjectParserManager: () => {
        return {
            describeMatchingObjectParsers: describeObjectParsersMock
        };
    },
    getAsserterManager: () => {
        return {
            describeMatchingAsserters: describeAssertersMock
        };
    },
    describeLoadedModules: describeLoadedModulesMock
}));

const exitMock = jest.fn();
describe('CommandLineConfiguration', () => {
    beforeEach(() => {
        describeProtocolsMock.mockClear();
        describeReportFormattersMock.mockClear();
        describeObjectParsersMock.mockClear();
        describeLoadedModulesMock.mockClear();
        consoleLogMock.mockClear();

        exitMock.mockClear();
        // @ts-ignore
        process.exit = exitMock;
    });

    it('should not throw', () => {
        // @ts-ignore
        expect(() => new CommandLineConfiguration(undefined)).not.toThrow();
    });

    it('verbosity -b', () => {
        const logLevel = 'info';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-b', logLevel]);

        expect(commandLineConfiguration.getVerbosity()).toBe(logLevel);
    });

    it('verbosity --verbosity', () => {
        const logLevel = 'info';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--verbosity', logLevel]);

        expect(commandLineConfiguration.getVerbosity()).toBe(logLevel);
    });

    it('verbosity -m', () => {
        const maxLevel = 3;
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-m', maxLevel.toString()]);

        expect(commandLineConfiguration.getMaxReportLevelPrint()).toBe(maxLevel);
    });

    it('verbosity --max-report-level-print', () => {
        const maxLevel = 3;
        const commandLineConfiguration = new CommandLineConfiguration([
            'node',
            'test',
            '--max-report-level-print',
            maxLevel.toString()
        ]);

        expect(commandLineConfiguration.getMaxReportLevelPrint()).toBe(maxLevel);
    });

    it('verbosity --max-report-level-print default', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getMaxReportLevelPrint()).toBeUndefined();
    });

    it('undefined logLevel', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getVerbosity()).toBe('warn');
    });

    it('default console output', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getStdoutRequisitionOutput()).toBeFalsy();
    });

    it('set console output -o', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-o']);

        expect(commandLineConfiguration.getStdoutRequisitionOutput()).toBeTruthy();
    });

    it('set console output --stdout-requisition-output', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--stdout-requisition-output']);

        expect(commandLineConfiguration.getStdoutRequisitionOutput()).toBeTruthy();
    });

    it('default passing tests', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getShowPassingTests()).toBeFalsy();
    });

    it('set passing tests -i', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-i']);

        expect(commandLineConfiguration.getShowPassingTests()).toBeTruthy();
    });

    it('set passing tests --show-passing-tests', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--show-passing-tests']);

        expect(commandLineConfiguration.getShowPassingTests()).toBeTruthy();
    });

    it('getConfigFileName -c', () => {
        const configFile = 'minusC';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-c', configFile]);

        expect(commandLineConfiguration.getConfigFileName()).toBe(configFile);
    });

    it('getConfigFileName --config-file', () => {
        const configFile = 'configFile';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--config-file', configFile]);

        expect(commandLineConfiguration.getConfigFileName()).toBe(configFile);
    });

    it('describe protocols -p', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-p']);
        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeProtocolsMock).toHaveBeenCalledWith(undefined);
    });

    it('describe protocols --protocols-description', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--protocols-description']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeProtocolsMock).toHaveBeenCalledWith(undefined);
    });

    it('describe protocols --protocols-description http', () => {
        const params = 'http';
        const commandLineConfiguration = new CommandLineConfiguration([
            'node',
            'test',
            '--protocols-description',
            params
        ]);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeProtocolsMock).toHaveBeenCalledWith(params);
    });

    it('describe formatters -f', () => {
        const params = 'json';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-f', params]);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeReportFormattersMock).toHaveBeenCalledWith(params);
    });

    it('describe formatters --formatters-description', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--formatters-description']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeReportFormattersMock).toHaveBeenCalledWith(true);
    });

    it('describe parsers list -e', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-e']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(describeObjectParsersMock).toHaveBeenCalledWith(true);
    });

    it('describe --parsers-list', () => {
        const params = 'csv';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--parsers-list', params]);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(describeObjectParsersMock).toHaveBeenCalledWith(params);
    });

    it('describe assertions -t', () => {
        const params = 'expect';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-t', params]);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(describeAssertersMock).toHaveBeenCalledWith(params);
    });

    it('describe assertions --tests-list', () => {
        const params = 'expect';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--tests-list', params]);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(describeAssertersMock).toHaveBeenCalledWith(params);
    });

    it('describe loaded modules -u', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-u']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeLoadedModulesMock).toHaveBeenCalledWith();
    });

    it('describe loaded modules --loaded-modules-list', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--loaded-modules-list']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalledWith(0);
        expect(describeLoadedModulesMock).toHaveBeenCalledWith();
    });

    it('no file', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getTestFiles()).toEqual([]);
        expect(commandLineConfiguration.getTestFilesIgnoringOthers()).toEqual([]);
    });

    it('add file <no dash>', () => {
        const testFile1 = 'filename1';
        const testFile2 = 'filename2';
        const commandLineConfiguration = new CommandLineConfiguration([
            'node',
            'test',
            '-e',
            testFile1,
            '-b',
            'debug',
            testFile2
        ]);

        expect(commandLineConfiguration.getTestFiles().sort()).toEqual([testFile2, testFile1].sort());
    });

    it('add test file', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', 'file', 'file2']);

        expect(commandLineConfiguration.getTestFiles()).toEqual(['file', 'file2']);
    });

    it('add plugin', () => {
        const commandLineConfiguration = new CommandLineConfiguration([
            'node',
            'test',
            '-l',
            'plugin1',
            '--add-plugin',
            'plugin2'
        ]);

        expect(commandLineConfiguration.getPlugins()).toEqual(['plugin1', 'plugin2']);
    });

    it('render help', () => {
        new CommandLineConfiguration(['node', 'test', '-h']);
        expect(consoleLogMock).toHaveBeenCalled();
    });

    it('get version', () => {
        const packageJson = require('../../package.json');

        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-v']);
        expect(commandLineConfiguration.getVersion()).toBe(packageJson.version);
    });

    it('getStore -s', () => {
        const option = ['-s', '--store'];
        const store: any = {
            key: 'value',
            'composed-name': 'stuff',
            number: '10'
        };
        const newArguments = ['node', 'test'];
        Object.keys(store).forEach((key, index) => {
            newArguments.push(option[index % option.length]);
            newArguments.push(key + '=' + store[key]);
        });
        const commandLineConfiguration = new CommandLineConfiguration(newArguments);

        expect(commandLineConfiguration.getStore()).toEqual(store);
    });
});
