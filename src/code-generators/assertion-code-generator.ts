import {Tester} from '../testers/tester';
import {Assertion} from '../events/assertion';

export class AssertionCodeGenerator {
    private testerInstanceName: string;
    private testerMethods: string[];
    private tester: any;

    public constructor(testerInstanceName: string) {
        this.tester = new Tester();
        this.testerInstanceName = testerInstanceName;
        this.testerMethods = this.identifyTesterMethods();
    }

    public generate(assertion: Assertion): string {
        const assertionName = assertion.name;
        try {
            assertion = this.removeField('name', assertion);
        } catch (err) {
            return `;${this.testerInstanceName}.addTest({
                        errorDescription: \`${err}'\`,
                        valid: false,
                        label: 'Required field \'name\' found'
                    });`;
        }

    const argumentsLength = Object.getOwnPropertyNames(assertion).length;
        if (argumentsLength == 1) {
            return this.executeOneArgumentFunction(assertionName, assertion);
        } else if (argumentsLength == 2) {
            return this.executeTwoArgumentsFunction(assertionName, assertion);
        } else {
            return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class does not work with '${argumentsLength}' arguments function'\`,
                    valid: false,
                    label: 'Assertion identified'
                });`;
        }
    }

    private executeOneArgumentFunction(assertionName: string, assertion: any) {
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;   try {
                            ${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${value});
                        } catch (err) {
                            ${this.testerInstanceName}.addTest({
                                errorDescription: \`Error executing assertion: '\${err}'\`,
                                valid: false,
                                label: 'Assertion code valid'
                            });
                        }`;
        }
        return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class has no one argument method called '${assertionMethodName}'\`,
                    valid: false,
                    label: 'Known assertion method'
                });`;
    }

    private executeTwoArgumentsFunction(assertionName: any, assertion: any): string {
        const expect = assertion.expect;
        try {
            assertion = this.removeField('expect', assertion);
        } catch (err) {
            return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`${err}'\`,
                    valid: false,
                    label: 'Required 'expect' not found'
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
                                label: 'Assertion code valid'
                            });
                        }`;
        }
        return `;${this.testerInstanceName}.addTest({
                    errorDescription: \`Tester class has no two arguments method called '${assertionMethodName}'\`,
                    valid: false,
                    label: 'Known assertion method'
                });`;
    }

    private removeField(field: string, test: any): any {
        let clone: any = Object.assign({}, test);
        if (!clone[field]) {
            throw new Error(`Test has to have a '${field}' field`);
        }
        delete clone[field];
        return clone;
    }

    private identifyTesterMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this.tester)).filter(methodName => methodName != 'constructor');
    }
}