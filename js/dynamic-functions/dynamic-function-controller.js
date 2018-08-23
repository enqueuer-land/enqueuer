"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
class DynamicFunctionController {
    constructor(functionBody) {
        this.arguments = [];
        this.functionBody = functionBody;
    }
    addArgument(name, value) {
        this.arguments.push({ name: name, value: value });
    }
    execute() {
        const createdFunction = this.createFunction();
        if (createdFunction) {
            return this.executeFunction(createdFunction);
        }
    }
    createFunction() {
        try {
            const constructorArgs = this.arguments.map(arg => arg.name).concat(this.functionBody);
            return ((...args) => new Function(...args)).apply(null, constructorArgs);
        }
        catch (err) {
            logger_1.Logger.error(`Error creating function '${err}'`);
            throw err;
        }
    }
    executeFunction(dynamicFunction) {
        try {
            const callArgs = this.arguments.map(arg => arg.value);
            return dynamicFunction.apply(this, callArgs);
        }
        catch (err) {
            logger_1.Logger.error(`Error running function '${err}'}`);
            throw err;
        }
    }
}
exports.DynamicFunctionController = DynamicFunctionController;
