import {Configuration} from "./configuration";

describe('Configuration', function() {

    describe('getLogLevel', function() {

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

    it('daemon run mode', function () {
        const configurationFile = {
                "run-mode": {
                    "daemon": ["bla"]
                }
        }
        const actualInput = new Configuration({}, configurationFile).getRequisitionRunMode()["daemon"];

        expect(actualInput).toEqual(["bla"]);
    });

    it('single run mode', function () {
        const configurationFile = {
                "run-mode": {
                    "single-run": "bla"
                }
        }
        const actualInput = new Configuration({}, configurationFile).getRequisitionRunMode()["single-run"];

        expect(actualInput).toBe("bla");
    });

    it('get requisition outputs from file', function () {
        const expectedOutput = ['someOutput'];
        const configurationFile = {
            outputs: expectedOutput
        }

        const actualOutput = new Configuration({}, configurationFile).getOutputs();

        expect(actualOutput).toBe(expectedOutput);
    });

    it('get variables from file', function () {
        const expectedVariable = {key: "value"};
        const configurationFile = {
            variables: expectedVariable
        }

        const actualOutput = new Configuration({}, configurationFile).getFileVariables();

        expect(actualOutput).toBe(expectedVariable);
    });

    it('get variables from command line', function () {
        const expectedVariable = {key: "value"};
        const configurationFile = {
            variables: expectedVariable
        }

        const actualOutput = new Configuration({}, configurationFile).getFileVariables();

        expect(actualOutput).toBe(expectedVariable);
    });

});