import {commanderRefresher, CommandLineConfiguration} from "./command-line-configuration";

describe('CommandLineConfiguration', () => {

    it('isQuietMode', () => {
        commanderRefresher({quiet: true});

        expect(CommandLineConfiguration.isQuietMode()).toBeTruthy();
    });

    it('isNotQuietMode', () => {
        commanderRefresher({quiet: false});

        expect(CommandLineConfiguration.isQuietMode()).toBeFalsy();
    });

    it('logLevel', () => {
        const logLevel = 'enqueuer';
        commanderRefresher({logLevel: logLevel});

        expect(CommandLineConfiguration.getLogLevel()).toBe(logLevel);
    });

    it('undefined logLevel', () => {
        commanderRefresher({});

        expect(CommandLineConfiguration.getLogLevel()).toBeUndefined();
    });

    it('getConfigFileName', () => {
        const configFile = 'enqueuer';
        commanderRefresher({configFile: configFile});

        expect(CommandLineConfiguration.getConfigFileName()).toBe(configFile);
    });

    it('undefined getConfigFileName', () => {
        commanderRefresher({});

        expect(CommandLineConfiguration.getConfigFileName()).toBeUndefined();
    });

    it('getStore', () => {
        const store = {
            key: 'value',
            otherKey: 10
        };
        commanderRefresher({commandLineStore: store});

        expect(CommandLineConfiguration.getStore()).toBe(store);
    });

});
