import {Assertion} from '../models/events/assertion';
import {TestModel} from '../models/outputs/test-model';
import {Asserter} from './asserter';

export class NullAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        return {
            name: 'Not known asserter',
            valid: false,
            description: 'Undefined asserter: ' + JSON.stringify(assertion)
        };
    }
}
