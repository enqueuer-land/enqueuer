import {CommandLineConfiguration} from './command-line-configuration';

// const setProperty = (object: any, property: string, value: any) => {
//     const originalProperty = Object.getOwnPropertyDescriptor(object, property);
//     Object.defineProperty(object, property, {value});
//     return originalProperty;
// };

describe('CommandLineConfiguration', () => {

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

    it('getConfigFileName <no dash>', () => {
        const configFile = 'filename';
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--some', 'test', configFile, '--other', 'stuff']);

        expect(commandLineConfiguration.getConfigFileName()).toBe(configFile);
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

    // it('describe protocols -p', () => {
    //     // const exitMock = jest.fn()
    //     // setProperty(process, 'exit', exitMock)
    //
    //     const exitMock = jest.fn();
    //     process.exit = exitMock;
    //
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-p']);
    //
    //     expect(exitMock).toHaveBeenCalled();
    // });
    //
    // it('describe protocols --protocols-description', () => {
    //     const exitMock = jest.fn();
    //     process.exit = exitMock;
    //
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--protocols-description']);
    //
    //     expect(exitMock).not.toHaveBeenCalled();
    // });
    //
    // it('describe protocols --protocols-description http', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--protocols-description', 'http']);
    //
    //     expect(commandLineConfiguration.describeProtocols()).toBe('http');
    // });
    //
    // it('no describe protocols', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);
    //
    //     expect(commandLineConfiguration.describeProtocols()).toBeUndefined();
    // });
    //
    // it('describe formatters -f', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-f', 'json']);
    //
    //     expect(commandLineConfiguration.describeFormatters()).toBeTruthy();
    // });
    //
    // it('describe formatters --formatters-description', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--formatters-description']);
    //
    //     expect(commandLineConfiguration.describeFormatters()).toBeTruthy();
    // });
    //
    // it('no describe formatters', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);
    //
    //     expect(commandLineConfiguration.describeProtocols()).toBeUndefined();
    // });
    //
    // it('describe assertions -t', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-t']);
    //
    //     expect(commandLineConfiguration.describeTestsList()).toBeTruthy();
    // });
    //
    // it('describe assertions --tests-list', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '--tests-list']);
    //
    //     expect(commandLineConfiguration.describeTestsList()).toBeTruthy();
    // });
    //
    // it('no describe assertions', () => {
    //     const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);
    //
    //     expect(commandLineConfiguration.describeTestsList()).toBeUndefined();
    // });
    //
    it('no single run file', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test']);

        expect(commandLineConfiguration.getSingleRunFiles()).toEqual([]);
        expect(commandLineConfiguration.getSingleRunFilesIgnoring()).toEqual([]);
    });

    it('add single run file', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-a', 'file', '--add-file', 'file2']);

        expect(commandLineConfiguration.getSingleRunFiles()).toEqual(['file', 'file2']);
    });

    it('add plugin', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-l', 'plugin1', '--add-plugin', 'plugin2']);

        expect(commandLineConfiguration.getPlugins()).toEqual(['plugin1', 'plugin2']);
    });

    it('add single run file ignoring', () => {
        const commandLineConfiguration = new CommandLineConfiguration(['node', 'test', '-A', 'file', '--add-file-and-ignore-others', 'file2']);

        expect(commandLineConfiguration.getSingleRunFilesIgnoring()).toEqual(['file', 'file2']);
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
