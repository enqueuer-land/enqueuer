import {Assertion} from '../models/events/assertion';
import {NullAsserter} from './null-asserter';

describe('NullAsserter', () => {
    it('should return invalid', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            unknown: 2,
        };

        const expectToBeEqualToAsserter = new NullAsserter().assert(assertion, {});
        expect(expectToBeEqualToAsserter).toEqual({
            'description': 'Undefined asserter: [object Object]',
            'name': 'Not known asserter',
            'valid': false
        });
    });
});
