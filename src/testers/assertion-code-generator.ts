import {Tester} from './tester';
import {Assertion} from './assertion';

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
        assertion = this.removeField('name', assertion);
        const argumentsLength = Object.getOwnPropertyNames(assertion).length;
        if (argumentsLength == 1) {
            return this.executeOneArgumentFunction(assertionName, assertion);
        } else if (argumentsLength == 2) {
            return this.executeTwoArgumentsFunction(assertionName, assertion);
        } else {
            throw new Error(`Tester class does not work with ${argumentsLength} arguments functions`);
        }

    }

    private executeOneArgumentFunction(assertionName: string, assertion: any) {
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${value});`;
        }
        throw new Error(`Tester class has no method called '${assertionMethodName}'. Available ones are: ${this.testerMethods}`);
    }

    private executeTwoArgumentsFunction(assertionName: any, assertion: any): string {
        const expected = assertion.expected;
        assertion = this.removeField('expected', assertion);
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];
        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertionName}\`, ${expected}, ${value});`;
        }
        throw new Error(`Tester class has no method called '${assertionMethodName}'. Available ones are: ${this.testerMethods}`);
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