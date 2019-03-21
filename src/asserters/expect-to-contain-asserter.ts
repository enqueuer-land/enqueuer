import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToContainAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const actual = assertion.expect;
        const expected = assertion.toContain;

        if (typeof (actual) === 'string') {
            if (typeof (expected) === 'string') {
                return {
                    name,
                    valid: actual.indexOf(expected) != -1,
                    description: `Expecting '${literal.expect}' (${actual}) to contain '${expected}'`
                };
            } else {
                return {
                    name,
                    valid: false,
                    description: `Expecting 'toContain' to be a 'string'. Received a '${typeof (expected)}' instead`
                };
            }
        } else if (Array.isArray((actual))) {
            return {
                name,
                valid: actual.includes(expected),
                description: `Expecting '${literal.expect}' (${actual}) to contain '${expected}'`
            };
        } else {
            return {
                name,
                valid: false,
                description: `Expecting '${literal.expect}' to be a string or an array. Received a '${typeof (actual)}'`
            };
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {expect: 'actual value (string | array)', toContain: 'element (char | object)'},
        () => new ExpectToContainAsserter());
}
