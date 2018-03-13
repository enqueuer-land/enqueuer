import {Configuration} from "./configuration";

describe('Configuration', function() {

    class ConfigurationReset extends Configuration {
        public constructor() {
            super({}, {});
        }
        public reset(): void {
            delete Configuration.singleton;
        }
    }

    const configurationReset: ConfigurationReset = new ConfigurationReset();

    beforeEach(() => {
        configurationReset.reset();
    })

    describe('getLogLevel', function() {
        it('should check \'Verbose\' mode in command line', function() {
            const expectedLevel = 'debug';
            const commandLine = {
                verbose: expectedLevel
            }
            const actualLevel = Configuration.getInstance(commandLine).getLogLevel();

            expect(actualLevel).toBe(expectedLevel);
        });

        it('should check \'LogLevel\' in command line', function() {
            const expectedLevel = 'anyStuff';
            const commandLine = {
                logLevel: expectedLevel
            }
            const actualLevel = Configuration.getInstance(commandLine).getLogLevel();

            expect(actualLevel).toBe(expectedLevel);
        });

        it('should check \'log-level\' in configuration file', function() {
            const expectedLevel = 'anyStuff';
            const configurationFile = {
                'log-level': expectedLevel
            }
            const actualLevel = Configuration.getInstance({}, configurationFile).getLogLevel();

            expect(actualLevel).toBe(expectedLevel);
        });

    });

    it('get requisition inputs from file', function () {
        const fileInput = ['input'];
        const configurationFile = {
            requisition: {
                inputs: fileInput
            }
        }
        const actualInput = Configuration.getInstance({}, configurationFile).getInputs();

        expect(actualInput).toBe(fileInput);
    });

    it('get requisition outputs from file', function () {
        const expectedOutput = ['someOutput'];
        const configurationFile = {
            requisition: {
                outputs: expectedOutput
            }
        }
        const actualOutput = Configuration.getInstance({}, configurationFile).getOutputs();

        expect(actualOutput).toBe(expectedOutput);
    });
    
});