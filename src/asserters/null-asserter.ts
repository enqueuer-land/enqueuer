import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';
import { Asserter } from './asserter';

export class NullAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        delete assertion.name;
        return {
            name: 'Not known asserter',
            valid: false,
            description: 'Undefined asserter: [' + Object.keys(assertion).join('; ') + ']'
        };
    }
}
