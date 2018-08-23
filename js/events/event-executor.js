"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("../testers/tester");
const dynamic_function_controller_1 = require("../dynamic-functions/dynamic-function-controller");
const store_1 = require("../configurations/store");
const logger_1 = require("../loggers/logger");
const event_code_generator_1 = require("../code-generators/event-code-generator");
class EventExecutor {
    constructor(event) {
        this.testerInstanceName = 'tester';
        this.storeInstanceName = 'store';
        this.arguments = [];
        this.event = event;
    }
    execute() {
        if (!this.event) {
            return [];
        }
        this.event = this.initializeEvent(this.event);
        logger_1.Logger.trace(`Executing event function`);
        const eventCodeGenerator = new event_code_generator_1.EventCodeGenerator(this.testerInstanceName, this.storeInstanceName, this.event);
        const code = eventCodeGenerator.generate();
        return this.runEvent(code).map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
    }
    initializeEvent(event) {
        return {
            script: event.script || '',
            store: event.store || {},
            assertions: this.prepareAssertions(event.assertions || [])
        };
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
    runEvent(script) {
        const scriptExecutor = new dynamic_function_controller_1.DynamicFunctionController(script);
        let tester = new tester_1.Tester();
        scriptExecutor.addArgument(this.testerInstanceName, tester);
        scriptExecutor.addArgument(this.storeInstanceName, store_1.Store.getData());
        this.arguments.forEach(argument => {
            scriptExecutor.addArgument(argument.name, argument.value);
        });
        scriptExecutor.execute();
        return tester.getReport();
    }
}
exports.EventExecutor = EventExecutor;
