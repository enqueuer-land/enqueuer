import {AsserterManager} from './asserter-manager';
import {ExpectToBeEqualToAsserter} from '../asserters/expect-to-be-equal-to-asserter';
import {NullAsserter} from '../asserters/null-asserter';

describe('AsserterManager', () => {
    it('should create proper asserter', () => {

        const asserterManager = new AsserterManager();
        asserterManager.addAsserter((assertion) => !!assertion.equals, () => new ExpectToBeEqualToAsserter());

        const asserter = asserterManager.createAsserter({name: 'any', equals: true});

        expect(asserter).toBeInstanceOf(ExpectToBeEqualToAsserter);
    });

    it('should create Null asserter', () => {

        const asserterManager = new AsserterManager();
        asserterManager.addAsserter((assertion) => !!assertion.equals, () => new ExpectToBeEqualToAsserter());

        const asserter = asserterManager.createAsserter({name: 'any'});

        expect(asserter).toBeInstanceOf(NullAsserter);
    });
});
