import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeLessThanOrEqualToAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const actual = assertion.expect;
        const expected = assertion.toBeLessThanOrEqualTo;

        return {
            name,
            valid: actual <= expected,
            description: `Expected '${literal.expect}' to be less than or equal to '${expected}'. Received '${actual}'`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        (assertion: Assertion) => assertion.expect !== undefined && assertion.toBeLessThanOrEqualTo !== undefined,
        () => new ExpectToBeLessThanOrEqualToAsserter());
}
