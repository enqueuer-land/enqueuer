import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';
import { Asserter } from './asserter';
import { MainInstance } from '../plugins/main-instance';

export class ExpectToContainAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const actual = assertion.expect;
        const expected = assertion.toContain;
        const not = assertion.not !== undefined;

        if (typeof (actual) === 'string') {
            if (typeof (expected) === 'string') {
                return {
                    name: assertion.name,
                    valid: not ? actual.indexOf(expected) === -1 : actual.indexOf(expected) !== -1,
                    description: `Expecting '${actual}' (${literal.expect})${not ? ' not' : ''} to contain '${expected}'`
                };
            } else {
                return {
                    name: assertion.name,
                    valid: false,
                    description: `Expecting 'toContain' to be a 'string'. Received a '${typeof (expected)}' instead`
                };
            }
        } else if (Array.isArray((actual))) {
            return {
                name: assertion.name,
                valid: not ? !actual.includes(expected) : actual.includes(expected),
                description: `Expecting '${actual}' (${literal.expect})${not ? ' not' : ''} to contain '${expected}'`
            };
        } else {
            return {
                name: assertion.name,
                valid: false,
                description: `Expecting '${literal.expect}' to be a string or an array. Received a '${typeof (actual)}'`
            };
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {
            expect: {
                description: 'actual value',
                type: ['string', 'array']
            },
            not: {
                required: false,
                description: 'negates',
                type: 'null'
            },
            toContain: {
                description: 'element',
                type: ['string', 'any']
            },
        },
        () => new ExpectToContainAsserter());
}
