import {Configuration} from "./configuration";

describe('Configuration', function() {

    describe('getLogLevel', function() {
        it('should check \'Verbose\' mode in command line', function() {
            const expectedLevel = 'debug';
            const commandLine = {
                verbose: expectedLevel
            }
            const actualLevel = new Configuration(commandLine).getLogLevel();

            expect(actualLevel).toBe(expectedLevel);
        });

        it('should check \'LogLevel\' in command line', function() {
            const expectedLevel = 'anyStuff';
            const commandLine = {
                logLevel: expectedLevel
            }
            const actualLevel = new Configuration(commandLine).getLogLevel();

            expect(actualLevel).toBe(expectedLevel);
        });

        it('should check \'log-level\' in configuration file', function() {
            const expectedLevel = 'anyStuff';
            const configurationFile = {
                'log-level': expectedLevel
            }
            const actualLevel = new Configuration({}, configurationFile).getLogLevel();

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
        const actualInput = new Configuration({}, configurationFile).getInputs();

        expect(actualInput).toBe(fileInput);
    });

    it('get requisition outputs from file', function () {
        const expectedOutput = ['someOutput'];
        const configurationFile = {
            requisition: {
                outputs: expectedOutput
            }
        }

        const actualOutput = new Configuration({}, configurationFile).getOutputs();

        expect(actualOutput).toBe(expectedOutput);
    });
    
});