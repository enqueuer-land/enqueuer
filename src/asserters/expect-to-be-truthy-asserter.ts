import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeTruthyAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const expected = assertion.expectToBeTruthy;

        return {
            name,
            valid: !!expected,
            description: `Expecting '${literal.expect}' to be true`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {expectToBeTruthy: 'value expected to be true'},
        () => new ExpectToBeTruthyAsserter());
}
