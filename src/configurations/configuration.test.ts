import {Configuration} from "./configuration";
import { expect } from 'chai';
import 'mocha';

const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);

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

    beforeEach('Reset singleton', () => {
        configurationReset.reset();
    })

    describe('getLogLevel', function() {
        it('should check \'Verbose\' mode in command line', function() {
            const expectedLevel = 'debug';
            const commandLine = {
                verbose: expectedLevel
            }
            const actualLevel = Configuration.getInstance(commandLine).getLogLevel();

            expect(actualLevel).to.equal(expectedLevel);
        });

        it('should check \'LogLevel\' in command line', function() {
            const expectedLevel = 'anyStuff';
            const commandLine = {
                logLevel: expectedLevel
            }
            const actualLevel = Configuration.getInstance(commandLine).getLogLevel();

            expect(actualLevel).to.equal(expectedLevel);
        });

        it('should check \'log-level\' in configuration file', function() {
            const expectedLevel = 'anyStuff';
            const configurationFile = {
                'log-level': expectedLevel
            }
            const actualLevel = Configuration.getInstance({}, configurationFile).getLogLevel();

            expect(actualLevel).to.equal(expectedLevel);
        });

    });
});