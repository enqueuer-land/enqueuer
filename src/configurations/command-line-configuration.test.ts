import {commanderRefresher, CommandLineConfiguration} from "./command-line-configuration";

describe('CommandLineConfiguration', () => {

    it('isQuietMode', () => {
        commanderRefresher(['node', 'test', '-q']);

        expect(CommandLineConfiguration.isQuietMode()).toBeTruthy();
    });

    it('isNotQuietMode', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.isQuietMode()).toBeFalsy();
    });

    it('verbosity -b', () => {
        const logLevel = 'info';
        commanderRefresher(['node', 'test', '-b', logLevel]);

        expect(CommandLineConfiguration.getVerbosity()).toBe(logLevel);
    });

    it('verbosity --verbosity', () => {
        const logLevel = 'info';
        commanderRefresher(['node', 'test', '--verbosity', logLevel]);

        expect(CommandLineConfiguration.getVerbosity()).toBe(logLevel);
    });

    it('undefined logLevel', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.getVerbosity()).toBe('warn');
    });

    it('default console output', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.getStdoutRequisitionOutput()).toBeFalsy();
    });

    it('set console output -o', () => {
        commanderRefresher(['node', 'test', '-o']);

        expect(CommandLineConfiguration.getStdoutRequisitionOutput()).toBeTruthy();
    });

    it('set console output --stdout-requisition-output', () => {
        commanderRefresher(['node', 'test', '--stdout-requisition-output']);

        expect(CommandLineConfiguration.getStdoutRequisitionOutput()).toBeTruthy();
    });

    it('getConfigFileName <no dash>', () => {
        const configFile = 'filename';
        commanderRefresher(['node', 'test', '--some', 'test', configFile, '--other', 'stuff', ]);

        expect(CommandLineConfiguration.getConfigFileName()).toBe(configFile);
    });

    it('getConfigFileName -c', () => {
        const configFile = 'minusC';
        commanderRefresher(['node', 'test', '-c', configFile]);

        expect(CommandLineConfiguration.getConfigFileName()).toBe(configFile);
    });

    it('getConfigFileName --config-file', () => {
        const configFile = 'configFile';
        commanderRefresher(['node', 'test', '--config-file', configFile]);

        expect(CommandLineConfiguration.getConfigFileName()).toBe(configFile);
    });

    it('describe protocols -p', () => {
        commanderRefresher(['node', 'test', '-p']);

        expect(CommandLineConfiguration.describeProtocols()).toBeTruthy();
    });

    it('describe protocols --protocols-description', () => {
        commanderRefresher(['node', 'test', '--protocols-description']);

        expect(CommandLineConfiguration.describeProtocols()).toBeTruthy();
    });

    it('describe protocols --protocols-description', () => {
        commanderRefresher(['node', 'test', '--protocols-description', 'http']);

        expect(CommandLineConfiguration.describeProtocols()).toBe('http');
    });

    it('no describe protocols', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.describeProtocols()).toBeUndefined();
    });

    it('describe formatters -f', () => {
        commanderRefresher(['node', 'test', '-f']);

        expect(CommandLineConfiguration.describeFormatters()).toBeTruthy();
    });

    it('describe formatters --formatters-description', () => {
        commanderRefresher(['node', 'test', '--formatters-description']);

        expect(CommandLineConfiguration.describeFormatters()).toBeTruthy();
    });

    it('no describe formatters', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.describeProtocols()).toBeUndefined();
    });

    it('describe assertions -t', () => {
        commanderRefresher(['node', 'test', '-t']);

        expect(CommandLineConfiguration.describeTestsList()).toBeTruthy();
    });

    it('describe assertions --tests-list', () => {
        commanderRefresher(['node', 'test', '--tests-list']);

        expect(CommandLineConfiguration.describeTestsList()).toBeTruthy();
    });

    it('no describe assertions', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.describeTestsList()).toBeUndefined();
    });

    it('no single run file', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.singleRunFiles()).toEqual([]);
        expect(CommandLineConfiguration.singleRunFilesIgnoring()).toEqual([]);
    });

    it('add single run file', () => {
        commanderRefresher(['node', 'test', '-a', 'file', '--add-file', 'file2']);

        expect(CommandLineConfiguration.singleRunFiles()).toEqual(['file', 'file2']);
    });

    it('add plugin', () => {
        commanderRefresher(['node', 'test', '-l', 'plugin1', '--add-plugin', 'plugin2']);

        expect(CommandLineConfiguration.getPlugins()).toEqual(['plugin1', 'plugin2']);
    });

    it('add single run file ignoring', () => {
        commanderRefresher(['node', 'test', '-A', 'file', '--add-file-and-ignore-others', 'file2']);

        expect(CommandLineConfiguration.singleRunFilesIgnoring()).toEqual(['file', 'file2']);
    });

    it('handle null procces.argv', () => {
        // @ts-ignore
        expect (() => commanderRefresher()).not.toThrow();
    });

    it('getStore -s', () => {
        const option = ['-s', '--store'];
        const store = {
            key: 'value',
            'composed-name': 'stuff',
            number: '10'
        };
        const newArguments = ['node', 'test'];
        Object.keys(store).forEach((key, index) => {
            newArguments.push(option[index%option.length]);
            newArguments.push(key + '=' + store[key]);
        });
        commanderRefresher(newArguments);

        expect(CommandLineConfiguration.getStore()).toEqual(store);
    });

});
