"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("./tester");
class AssertionCodeGenerator {
    constructor(testerInstanceName) {
        this.tester = new tester_1.Tester();
        this.testerInstanceName = testerInstanceName;
        this.testerMethods = this.identifyTesterMethods();
    }
    generate(assertion) {
        const assertionName = assertion.name;
        assertion = this.removeField('name', assertion);
        const argumentsLength = Object.getOwnPropertyNames(assertion).length;
        if (argumentsLength == 1) {
            return this.executeOneArgumentFunction(assertionName, assertion);
        }
        else if (argumentsLength == 2) {
            return this.executeTwoArgumentsFunction(assertionName, assertion);
        }
        else {
            throw new Error(`Tester class does not work with ${argumentsLength} arguments functions`);
        }
    }
    executeOneArgumentFunction(assertionName, assertion) {
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${value});`;
        }
        throw new Error(`Tester class has no method called '${assertionMethodName}'. Available ones are: ${this.testerMethods}`);
    }
    executeTwoArgumentsFunction(assertionName, assertion) {
        const expected = assertion.expected;
        assertion = this.removeField('expected', assertion);
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${expected}, ${value});`;
        }
        throw new Error(`Tester class has no method called '${assertionMethodName}'. Available ones are: ${this.testerMethods}`);
    }
    removeField(field, test) {
        let clone = Object.assign({}, test);
        if (!clone[field]) {
            throw new Error(`Test has to have a '${field}' field`);
        }
        delete clone[field];
        return clone;
    }
    identifyTesterMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this.tester)).filter(methodName => methodName != 'constructor');
    }
}
exports.AssertionCodeGenerator = AssertionCodeGenerator;
