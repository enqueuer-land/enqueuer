import {Tester} from './tester';
import {Assertion} from './event';

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
        const condition = this.getCondition(assertion);
        const assertionMethodName = Object.getOwnPropertyNames(condition)[0];

        if (this.tester[assertionMethodName] !== undefined) {
            const value = condition[assertionMethodName];
            return `;${this.testerInstanceName}.${assertionMethodName}(\`${assertion.label}\`, ${assertion.expected}, ${value});`;
        }
        throw new Error(`Tester class has no method called ${assertionMethodName}. Available ones are: ${this.testerMethods}`);
    }

    private getCondition(test: any): any {
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