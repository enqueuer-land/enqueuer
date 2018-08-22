"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("../testers/tester");
const assertion_code_generator_1 = require("../testers/assertion-code-generator");
const script_executor_1 = require("../testers/script-executor");
const store_1 = require("../testers/store");
const logger_1 = require("../loggers/logger");
class EventAsserter {
    constructor(event) {
        this.testerInstanceName = 'tester';
        this.arguments = [];
        this.assertions = [];
        this.script = '';
        if (event) {
            this.script = event.script || '';
            this.assertions = this.prepareAssertions(event.assertions || []);
        }
    }
    prepareAssertions(assertions) {
        let assertionCounter = 0;
        return assertions.map(assertion => {
            if (!assertion.name) {
                assertion.name = `Assertion #${assertionCounter.toString()}`;
            }
            ++assertionCounter;
            return assertion;
        });
    }
    addArgument(name, value) {
        this.arguments.push({ name: name, value: value });
    }
    assert() {
        logger_1.Logger.trace(`Executing event function`);
        let result = [];
        try {
            result = this.scriptRunner(this.script);
        }
        catch (err) {
            logger_1.Logger.error(`Error executing event function ${err}`);
            return [{ valid: false, label: 'Script code is valid', errorDescription: err.toString() }];
        }
        return this.testEachAssertion(result);
    }
    testEachAssertion(initial) {
        let result = [];
        this.assertions.forEach((assertion) => {
            try {
                result = result.concat(this.runAssertion(assertion));
            }
            catch (err) {
                result = result.concat({ valid: false, label: `Assertion '${assertion.name}' is valid`, errorDescription: err.toString() });
            }
        });
        return initial.concat(result);
    }
    runAssertion(assertion) {
        logger_1.Logger.trace(`Running assertion: ${JSON.stringify(assertion.name)}`);
        const assertionCodeGenerator = new assertion_code_generator_1.AssertionCodeGenerator(this.testerInstanceName);
        const code = assertionCodeGenerator.generate(assertion);
        logger_1.Logger.trace(`Assertion: ${JSON.stringify(assertion.name)} ran`);
        return this.scriptRunner(this.script + code);
    }
    scriptRunner(script) {
        const scriptExecutor = new script_executor_1.ScriptExecutor(script);
        let tester = new tester_1.Tester();
        scriptExecutor.addArgument('store', store_1.Store.getData());
        scriptExecutor.addArgument(this.testerInstanceName, tester);
        this.arguments.forEach(argument => {
            scriptExecutor.addArgument(argument.name, argument.value);
        });
        scriptExecutor.execute();
        return tester.getReport();
    }
}
exports.EventAsserter = EventAsserter;
