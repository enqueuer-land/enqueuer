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
        let remainingArguments = this.removeField('label', assertion);
        const argumentsLength = Object.getOwnPropertyNames(remainingArguments).length;
        if (argumentsLength == 1) {
            const assertionMethodName = Object.getOwnPropertyNames(remainingArguments)[0];
            if (this.tester[assertionMethodName] !== undefined) {
                const value = remainingArguments[assertionMethodName];
                return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertion.label}\`, ${value});`;
            }
            throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
        } else if (argumentsLength == 2) {
            remainingArguments = this.removeField('expected', remainingArguments);
            const assertionMethodName = Object.getOwnPropertyNames(remainingArguments)[0];
            if (this.tester[assertionMethodName] !== undefined) {
                const value = remainingArguments[assertionMethodName];
                return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertion.label}\`, ${assertion.expected}, ${value});`;
            }
            throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
        } else {
            throw new Error(`Tester class does not work with ${argumentsLength} arguments functions`);
        }

    }

    private removeField(field: string, test: any): any {
        let clone: any = Object.assign({}, test);
        if (!clone[field]) {
            throw new Error(`Test has to have a 'label' field`);
        }
        delete clone[field];
        return clone;
    }

    private identifyTesterMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this.tester)).filter(methodName => methodName != 'constructor');
    }
}