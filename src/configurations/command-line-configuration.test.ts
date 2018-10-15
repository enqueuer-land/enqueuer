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
        const logLevel = 'minusL';
        commanderRefresher(['node', 'test', '-b', logLevel]);

        expect(CommandLineConfiguration.getVerbosity()).toBe(logLevel);
    });

    it('verbosity --verbosity', () => {
        const logLevel = 'verbosity';
        commanderRefresher(['node', 'test', '--verbosity', logLevel]);

        expect(CommandLineConfiguration.getVerbosity()).toBe(logLevel);
    });

    it('undefined logLevel', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.getVerbosity()).toBeUndefined();
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

    it('no describe protocols', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.describeProtocols()).toBeUndefined();
    });

    it('describe mqtt protocol -p', () => {
        commanderRefresher(['node', 'test', '-p', 'mqtt']);

        expect(CommandLineConfiguration.describeProtocols()).toBe('mqtt');
    });

    it('describe mqtt protocol --protocolsDescription', () => {
        commanderRefresher(['node', 'test', '-p', 'mqtt']);

        expect(CommandLineConfiguration.describeProtocols()).toBe('mqtt');
    });

    it('no single run file', () => {
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.singleRunFiles()).toEqual([]);
        expect(CommandLineConfiguration.singleRunFilesIgnoring()).toEqual([]);
    });

    it('add single run file', () => {
        commanderRefresher(['node', 'test', '-a', 'file', '--add-file-single-run', 'file2']);

        expect(CommandLineConfiguration.singleRunFiles()).toEqual(['file', 'file2']);
    });

    it('add single run file ignoring', () => {
        commanderRefresher(['node', 'test', '-A', 'file', '--add-file-and-ignore-single-run', 'file2']);

        expect(CommandLineConfiguration.singleRunFilesIgnoring()).toEqual(['file', 'file2']);
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
