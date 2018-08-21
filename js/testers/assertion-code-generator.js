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
        let remainingArguments = this.removeField('label', assertion);
        const argumentsLength = Object.getOwnPropertyNames(remainingArguments).length;
        if (argumentsLength == 1) {
            const assertionMethodName = Object.getOwnPropertyNames(remainingArguments)[0];
            if (this.tester[assertionMethodName] !== undefined) {
                const value = remainingArguments[assertionMethodName];
                return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertion.label}\`, ${value});`;
            }
            throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
        }
        else if (argumentsLength == 2) {
            remainingArguments = this.removeField('expected', remainingArguments);
            const assertionMethodName = Object.getOwnPropertyNames(remainingArguments)[0];
            if (this.tester[assertionMethodName] !== undefined) {
                const value = remainingArguments[assertionMethodName];
                return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertion.label}\`, ${assertion.expected}, ${value});`;
            }
            throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
        }
        else {
            throw new Error(`Tester class does not work with ${argumentsLength} arguments functions`);
        }
    }
    removeField(field, test) {
        let clone = Object.assign({}, test);
        if (!clone[field]) {
            throw new Error(`Test has to have a 'label' field`);
        }
        delete clone[field];
        return clone;
    }
    identifyTesterMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this.tester)).filter(methodName => methodName != 'constructor');
    }
}
exports.AssertionCodeGenerator = AssertionCodeGenerator;
