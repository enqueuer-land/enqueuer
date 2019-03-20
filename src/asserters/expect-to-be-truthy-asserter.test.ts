import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeTruthyAsserter} from './expect-to-be-truthy-asserter';

describe('ExpectToBeTruthyAsserter', () => {
    it('should be truthy', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expectToBeTruthy: true,
        };

        const literal = {
            name: 'body.name',
            expectToBeTruthy: 'body.expected',
        };

        const test = new ExpectToBeTruthyAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should not be truthy', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
        };

        const literal = {
            name: 'body.name',
            expectToBeTruthy: 'body.expected',
        };

        const test = new ExpectToBeTruthyAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting 'undefined' to be true");
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (matcherFunction: Function, createFunction: Function) => {
                    expect(matcherFunction({expectToBeTruthy: true})).toBeTruthy();
                    expect(matcherFunction({expect: true})).toBeFalsy();
                    expect(createFunction()).toBeInstanceOf(ExpectToBeTruthyAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
