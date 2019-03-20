import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeFalsyAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const expected = assertion.expectToBeFalsy;

        return {
            name,
            valid: !!expected,
            description: `Expecting '${literal.expect}' to be false`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        (assertion: Assertion) => assertion.expectToBeFalsy !== undefined,
        () => new ExpectToBeFalsyAsserter());
}
