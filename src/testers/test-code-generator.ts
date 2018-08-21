import {Tester} from './tester';

export class TestCodeGenerator {
    private testerInstanceName: string;
    private testerMethods: string[];
    private tester: any;

    public constructor(testerInstanceName: string) {
        this.tester = new Tester();
        this.testerInstanceName = testerInstanceName;
        this.testerMethods = this.identifyTesterMethods();
    }

    public generate(test: any): string {
        const assertion = this.getAssertion(test);
        const assertionMethodName = Object.getOwnPropertyNames(assertion)[0];

        if (this.tester[assertionMethodName] !== undefined) {
            const value = assertion[assertionMethodName];
            return `${this.testerInstanceName}.${assertionMethodName}(\`${test.label}\`, ${test.expected}, ${value});`;
        }
        throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
    }

    private getAssertion(test: any): any {
        let clone: any = Object.assign({}, test);
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

    private identifyTesterMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this.tester));
    }
}