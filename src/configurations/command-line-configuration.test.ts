import {CommandLineConfiguration} from './command-line-configuration';

const exitMock = jest.fn();
describe('CommandLineConfiguration', () => {
    beforeEach(() => {
        exitMock.mockClear();
        // @ts-ignore
        process.exit = exitMock;
    });

    it('isQuietMode', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-q']);

        expect(commandLineConfiguration.isQuietMode()).toBeTruthy();
    });

    it('isNotQuietMode', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.isQuietMode()).toBeFalsy();
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

        expect(exitMock).toHaveBeenCalled();
    });

    it('describe protocols --protocols-description', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--protocols-description']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalled();
    });

    it('describe protocols --protocols-description http', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--protocols-description', 'http']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalled();
    });

    it('describe formatters -f', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-f', 'json']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalled();
    });

    it('describe formatters --formatters-description', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--formatters-description']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalled();
    });

    it('describe assertions -t', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-t']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalled();
    });

    it('describe assertions --tests-list', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--tests-list']);

        commandLineConfiguration.verifyPrematureActions();

        expect(exitMock).toHaveBeenCalled();
    });

    it('no single run file', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getTestFiles()).toEqual([]);
        expect(commandLineConfiguration.getTestFilesIgnoringOthers()).toEqual([]);
    });

    it('add file <no dash>', () => {
        const testFile1 = 'filename1';
        const testFile2 = 'filename2';
        const commandLineConfiguration = new CommandLineConfiguration(
            ['node', 'test', '--some', 'test', testFile1, '--other', 'stuff', testFile2]);

        expect(commandLineConfiguration.getTestFiles().sort()).toEqual([testFile2, testFile1].sort());
    });

    it('add single run file', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-a', 'file', '--add-file', 'file2']);

        expect(commandLineConfiguration.getTestFiles()).toEqual(['file', 'file2']);
    });

    it('add plugin', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-l', 'plugin1', '--add-plugin', 'plugin2']);

        expect(commandLineConfiguration.getPlugins()).toEqual(['plugin1', 'plugin2']);
    });

    it('render help', () => {
        const consoleMock = jest.fn();
        console.log = consoleMock;
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-h']);
        expect(consoleMock).toHaveBeenCalled();
    });

    it('get version', () => {
        const packageJson = require('../../package.json');

        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-v']);

        expect(commandLineConfiguration.getVersion()).toBe(packageJson.version);
    });

    it('add single run file ignoring', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-A', 'file', '--add-file-and-ignore-others', 'file2']);

        expect(commandLineConfiguration.getTestFilesIgnoringOthers()).toEqual(['file', 'file2']);
    });

    it('handle null procces.argv', () => {
        // @ts-ignore
        expect(() => new CommandLineConfiguration()).not.toThrow();
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
