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
        try {
            assertion = this.removeField('name', assertion);
        }
        catch (err) {
            return `;${this.testerInstanceName}.addTest({
                        errorDescription: \`${err}'\`,
                        valid: false,
                        label: 'Required field not found'
                    });`;
        }
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
                    label: 'Unknown assertion method'
                });`;
        }
    }
    executeOneArgumentFunction(assertionName, assertion) {
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;   try {
                            ${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${value});
                        } catch (err) {
                            ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing assertion: '\${err}'\`,
                                valid: false,
                                label: 'Unknown assertion method'
                            });
                        }`;
        }
        return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class has no one argument method called '${assertionMethodName}'\`,
                    valid: false,
                    label: 'Unknown assertion method'
                });`;
    }
    executeTwoArgumentsFunction(assertionName, assertion) {
        const expect = assertion.expect;
        try {
            assertion = this.removeField('expect', assertion);
        }
        catch (err) {
            return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`${err}'\`,
                    valid: false,
                    label: 'Required field not found'
                });`;
        }
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;   try {
                            ${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${expect}, ${value});
                        } catch (err) {
                            ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing assertion: '\${err}'\`,
                                valid: false,
                                label: 'Unknown assertion method'
                            });
                        }`;
        }
        return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class has no two arguments method called '${assertionMethodName}'\`,
                    valid: false,
                    label: 'Unknown assertion method'
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
}
exports.AssertionCodeGenerator = AssertionCodeGenerator;
