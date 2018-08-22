"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("../testers/tester");
const assertion_code_generator_1 = require("../testers/assertion-code-generator");
const script_executor_1 = require("../testers/script-executor");
const store_1 = require("../testers/store");
const logger_1 = require("../loggers/logger");
class EventExecutor {
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
    execute() {
        logger_1.Logger.trace(`Executing event function`);
        const code = this.addAssertions();
        return this.scriptRunner(code).map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
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
    addAssertions() {
        //TODO extract to its own class
        let code = `try {
            ${this.script}
        } catch (err) {
            ${this.testerInstanceName}.addTest({
                    errorDescription: \`Error executing 'script' code: '\${err}'\`,
                    valid: false,
                    label: "Valid 'script' code"
                });
        }`;
        this.assertions.forEach((assertion) => {
            const assertionCodeGenerator = new assertion_code_generator_1.AssertionCodeGenerator(this.testerInstanceName);
            code += assertionCodeGenerator.generate(assertion);
        });
        return code;
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
exports.EventExecutor = EventExecutor;
