import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeEqualToAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const actual = assertion.expect;
        const expected = assertion.toBeEqualTo;

        if (typeof (actual) === 'object' && typeof (expected) === 'object') {
            const stringifiedActual = JSON.stringify(actual, null, 2);
            const stringifiedExpected = JSON.stringify(expected, null, 2);
            return {
                name,
                valid: assertion.not === undefined ? stringifiedActual == stringifiedExpected : stringifiedActual != stringifiedExpected,
                description: `Expected '${literal.expect}'${assertion.not === undefined ?
                    '' : ' not'} to be equal to '${expected}'. Received '${actual}'`
            };
        } else {
            return {
                name,
                valid: assertion.not === undefined ? actual == expected : actual != expected,
                description: `Expected '${literal.expect}'${assertion.not === undefined ?
                    '' : ' not'} to be equal to '${expected}'. Received '${actual}'`
            };
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {
            expect: {
                type: 'number',
                description: 'actual value'
            }, not: {
                required: false,
                description: 'negates',
                type: 'null'
            }, toBeEqualTo: {
                type: 'number',
                description: 'expected value'
            }
        },
        () => new ExpectToBeEqualToAsserter());
}
