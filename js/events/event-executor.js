"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("../testers/tester");
const dynamic_function_controller_1 = require("../dynamic-functions/dynamic-function-controller");
const store_1 = require("../configurations/store");
const logger_1 = require("../loggers/logger");
const event_code_generator_1 = require("../code-generators/event-code-generator");
class EventExecutor {
    constructor(name, event) {
        this.testerInstanceName = 'tester';
        this.storeInstanceName = 'store';
        this.arguments = [];
        this.event = this.initializeEvent(event);
        this.name = name;
    }
    execute() {
        logger_1.Logger.trace(`Executing event function`);
        const eventCodeGenerator = new event_code_generator_1.EventCodeGenerator(this.testerInstanceName, this.storeInstanceName, this.event, this.name);
        const code = eventCodeGenerator.generate();
        return this.runEvent(code).map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
    }
    initializeEvent(event) {
        let result = {
            script: '',
            store: {},
            assertions: []
        };
        if (event) {
            result = {
                script: event.script || '',
                store: event.store || {},
                assertions: this.prepareAssertions(event.assertions || [])
            };
        }
        return result;
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
        const dynamicFunction = new dynamic_function_controller_1.DynamicFunctionController(script);
        let tester = new tester_1.Tester();
        dynamicFunction.addArgument(this.testerInstanceName, tester);
        dynamicFunction.addArgument(this.storeInstanceName, store_1.Store.getData());
        this.arguments.forEach(argument => {
            dynamicFunction.addArgument(argument.name, argument.value);
        });
        try {
            dynamicFunction.execute();
        }
        catch (err) {
            logger_1.Logger.error(`Error running event '${this.name}': ${err}`);
            tester.addTest({ valid: false, label: 'Event ran', errorDescription: err });
        }
        return tester.getReport();
    }
}
exports.EventExecutor = EventExecutor;
