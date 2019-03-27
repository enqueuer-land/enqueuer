import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';
import {MainInstance} from '../plugins/main-instance';

export class ExpectToBeDefinedAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const name: string = assertion.name;
        const expected = assertion.expectToBeDefined;

        return {
            name,
            valid: expected !== undefined,
            description: `Expecting '${literal.expectToBeDefined}' to be defined`
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {expectToBeDefined: {description: 'stuff to be defined'}},
        () => new ExpectToBeDefinedAsserter()
    );
}
