"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("./tester");
class TestCodeGenerator {
    constructor(testerInstanceName) {
        this.tester = new tester_1.Tester();
        this.testerInstanceName = testerInstanceName;
        this.testerMethods = this.identifyTesterMethods();
    }
    generate(test) {
        const assertion = this.getAssertion(test);
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `${this.testerInstanceName}.${assertionMethodName}(\`${test.label}\`, ${test.expected}, ${value});`;
        }
        throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
    }
    getAssertion(test) {
        let clone = Object.assign({}, test);
        if (!clone.label) {
            throw new Error(`Test has to have a 'label' field`);
        }
        if (!clone.expected) {
            throw new Error(`Test ${clone.label} to have a 'expected' field`);
        }
        delete clone.label;
        delete clone.expected;
        return clone;
    }
    identifyTesterMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this.tester));
    }
}
exports.TestCodeGenerator = TestCodeGenerator;
