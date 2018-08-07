"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const tester_1 = require("./tester");
const store_1 = require("./store");
class TesterExecutor {
    constructor(functionBody) {
        this.arguments = [];
        this.functionBody = functionBody;
    }
    addArgument(name, value) {
        this.arguments.push({ name: name, value: value });
    }
    execute() {
        try {
            const dynamicFunction = this.createFunction();
            try {
                return this.executeFunction(dynamicFunction);
            }
            catch (exc) {
                return this.executionError(exc);
            }
        }
        catch (exc) {
            return this.creationError(exc);
        }
    }
    createFunction() {
        const constructorArgs = ['store', 'tester']
            .concat(this.arguments.map(arg => arg.name))
            .concat(this.functionBody);
        const dynamicFunction = ((...args) => new Function(...args)).apply(null, constructorArgs);
        return dynamicFunction;
    }
    executeFunction(dynamicFunction) {
        let tester = new tester_1.Tester();
        let store = new store_1.Store();
        const callArgs = [store, tester].concat(this.arguments.map(arg => arg.value));
        dynamicFunction.apply(this, callArgs);
        return tester.getReport();
    }
    creationError(exc) {
        logger_1.Logger.error(`Error creating function: ${exc}`);
        return [{
                label: 'Function created',
                valid: false,
                description: exc.toString()
            }];
    }
    executionError(exc) {
        logger_1.Logger.error(`Error executing function: ${exc}`);
        return [{
                label: 'Function executed',
                valid: false,
                description: exc.toString()
            }];
    }
}
exports.TesterExecutor = TesterExecutor;
