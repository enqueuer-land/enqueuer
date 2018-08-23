"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tester_1 = require("../testers/tester");
class AssertionCodeGenerator {
    constructor(testerInstanceName) {
        this.tester = new tester_1.Tester();
        this.testerInstanceName = testerInstanceName;
        this.testerMethods = this.identifyTesterMethods();
    }
    generate(assertion) {
        const assertionName = assertion.name;
        try {
            assertion = this.removeField('name', assertion);
        }
        catch (err) {
            return this.fieldNotFoundError(err);
        }
        try {
            return this.executePattern(assertionName, assertion);
        }
        catch (err) {
            return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class does not recognize the pattern '${JSON.stringify(Object.keys(assertion))}'\`,
                    valid: false,
                    label: 'Known assertion method'
                });`;
        }
    }
    executePattern(assertionName, assertion) {
        const argumentsLength = Object.getOwnPropertyNames(assertion).length;
        if (argumentsLength == 1) {
            return this.executeOneArgumentFunction(assertionName, assertion);
        }
        else if (argumentsLength == 2) {
            return this.executeTwoArgumentsFunction(assertionName, assertion);
        }
        else {
            return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class does not work with '${argumentsLength}' arguments function'\`,
                    valid: false,
                    label: 'Assertion identified'
                });`;
        }
    }
    executeOneArgumentFunction(assertionName, assertion) {
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;   try {
                            ${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${value});
                        } ` + this.generateAssertionCodeCatch();
        }
        throw Error('One argument method');
    }
    executeTwoArgumentsFunction(assertionName, assertion) {
        const expect = assertion.expect;
        try {
            assertion = this.removeField('expect', assertion);
        }
        catch (err) {
            return this.fieldNotFoundError(err);
        }
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;   try {
                            ${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${expect}, ${value});
                        } ` + this.generateAssertionCodeCatch();
        }
        throw Error('Two arguments method');
    }
    fieldNotFoundError(err) {
        return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`${err}'\`,
                    valid: false,
                    label: 'Required field not found'
                });`;
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
    generateAssertionCodeCatch() {
        return `catch (err) {
                        ${this.testerInstanceName}.addTest({
                            errorDescription: \`Error executing assertion: '\${err}'\`,
                            valid: false,
                            label: 'Assertion code valid'
                        });
                    }`;
    }
}
exports.AssertionCodeGenerator = AssertionCodeGenerator;
