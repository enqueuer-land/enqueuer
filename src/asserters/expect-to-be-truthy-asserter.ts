import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';
import { Asserter } from './asserter';
import { MainInstance } from '../plugins/main-instance';

export class ExpectToBeTruthyAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const expected = assertion.expectToBeTruthy;

        return {
            name: assertion.name,
            valid: expected === true,
            description: `Expecting '${literal.expectToBeTruthy}' to be true. Received: ${expected}`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        { expectToBeTruthy: { description: 'value expected to be true' } },
        () => new ExpectToBeTruthyAsserter()
    );
}
