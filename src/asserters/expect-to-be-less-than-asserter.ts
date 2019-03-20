import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeLessThanAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const actual = assertion.expect;
        const expected = assertion.toBeLessThan;

        return {
            name,
            valid: actual < expected,
            description: `Expected '${literal.expect}' to be less than '${expected}'. Received '${actual}'`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        (assertion: Assertion) => assertion.expect !== undefined && assertion.toBeLessThan !== undefined,
        () => new ExpectToBeLessThanAsserter());
}
