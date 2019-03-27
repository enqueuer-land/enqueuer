import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeUndefinedAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const expected = assertion.expectToBeUndefined;

        return {
            name,
            valid: expected === undefined,
            description: `Expecting '${literal.expectToBeUndefined}' to be undefined`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {expectToBeUndefined: {description: 'value expected to be undefined'}},
        () => new ExpectToBeUndefinedAsserter());
}
