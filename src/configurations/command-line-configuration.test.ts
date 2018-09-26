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

    it('getConfigFileName default', () => {
        const defaultConfigFile = 'config.yml';
        commanderRefresher(['node', 'test']);

        expect(CommandLineConfiguration.getConfigFileName()).toBe(defaultConfigFile);
    });

    it('getConfigFileName <no dash>', () => {
        const configFile = 'filename';
        commanderRefresher(['node', 'test', '--some', 'test', configFile]);

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

    it('list libraries -l', () => {
        commanderRefresher(['node', 'test', '-l']);

        expect(CommandLineConfiguration.requestToListAvailableLibraries()).toBeTruthy();
    });

    it('list libraries --list-available-libraries', () => {
        commanderRefresher(['node', 'test', '--list-available-libraries']);

        expect(CommandLineConfiguration.requestToListAvailableLibraries()).toBeTruthy();
    });

    it('install library -i', () => {
        commanderRefresher(['node', 'test', '-i', 'amqp']);

        expect(CommandLineConfiguration.getLibrariesToInstall()).toEqual(['amqp'])
    });

    it('install library -i multiple', () => {
        commanderRefresher(['node', 'test', '-i', 'amqp', '-i', 'mqtt']);

        expect(CommandLineConfiguration.getLibrariesToInstall()).toEqual(['amqp', 'mqtt']);
    });

    it('install library --install-library', () => {
        commanderRefresher(['node', 'test', '--install-library', 'amqp', '-i', 'mqtt']);

        expect(CommandLineConfiguration.getLibrariesToInstall()).toEqual(['amqp', 'mqtt']);
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
