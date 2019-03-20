import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeGreaterThanOrEqualToAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const actual = assertion.expect;
        const expected = assertion.toBeGreaterThanOrEqualTo;

        return {
            name,
            valid: actual >= expected,
            description: `Expected '${literal.expect}' to be greater than or equal to '${expected}'. Received '${actual}'`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        (assertion: Assertion) => assertion.expect !== undefined && assertion.toBeGreaterThanOrEqualTo !== undefined,
        () => new ExpectToBeGreaterThanOrEqualToAsserter());
}
