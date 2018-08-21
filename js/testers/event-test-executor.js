"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("./tester");
const assertion_code_generator_1 = require("./assertion-code-generator");
const script_executor_1 = require("./script-executor");
const store_1 = require("./store");
const logger_1 = require("../loggers/logger");
class EventTestExecutor {
    constructor(event) {
        this.arguments = [];
        this.assertions = [];
        this.script = '';
        if (event) {
            this.script = event.script || '';
            this.assertions = event.assertions || [];
        }
    }
    addArgument(name, value) {
        this.arguments.push({ name: name, value: value });
    }
    execute() {
        logger_1.Logger.trace(`Executing event function`);
        let result = [];
        try {
            result = this.scriptRunner(this.script);
        }
        catch (err) {
            logger_1.Logger.error(`Error executing event function ${err}`);
            return [{ valid: false, label: 'Script code is valid', description: err.toString() }];
        }
        return this.testEachAssertion(result);
    }
    testEachAssertion(initial) {
        let result = [];
        this.assertions.forEach(assertion => {
            try {
                result = result.concat(this.runAssertion(assertion));
            }
            catch (err) {
                result = result.concat({ valid: false, label: `Assertion '${assertion.label}' is valid`, description: err.toString() });
            }
        });
        return initial.concat(result);
    }
    runAssertion(assertion) {
        const assertionCodeGenerator = new assertion_code_generator_1.AssertionCodeGenerator('tester');
        const code = assertionCodeGenerator.generate(assertion);
        return this.scriptRunner(this.script + code);
    }
    scriptRunner(script) {
        const scriptExecutor = new script_executor_1.ScriptExecutor(script);
        let tester = new tester_1.Tester();
        scriptExecutor.addArgument('store', store_1.Store.getData());
        scriptExecutor.addArgument('tester', tester);
        this.arguments.forEach(argument => {
            scriptExecutor.addArgument(argument.name, argument.value);
        });
        logger_1.Logger.trace(`Function result: ${scriptExecutor.execute()}`);
        return tester.getReport();
    }
}
exports.EventTestExecutor = EventTestExecutor;
