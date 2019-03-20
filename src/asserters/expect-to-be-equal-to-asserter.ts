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
                valid: stringifiedActual == stringifiedExpected,
                description: `Expected '${literal.expect}' to be equal to '${stringifiedExpected}'. Received '${stringifiedActual}'`
            };
        } else {
            return {
                name,
                valid: actual == expected,
                description: `Expected '${literal.expect}' to be equal to '${expected}'. Received '${actual}'`
            };
        }
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        (assertion: Assertion) => assertion.expect !== undefined && assertion.toBeEqualTo !== undefined,
        () => new ExpectToBeEqualToAsserter());
}
