import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeFalsyAsserter} from './expect-to-be-falsy-asserter';

describe('ExpectToBeFalsyAsserter', () => {
    it('should be falsy', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expectToBeFalsy: true,
        };

        const literal = {
            name: 'body.name',
            expectToBeFalsy: 'body.expected',
        };

        const test = new ExpectToBeFalsyAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should not be falsy', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
        };

        const literal = {
            name: 'body.name',
            expectToBeFalsy: 'body.expected',
        };

        const test = new ExpectToBeFalsyAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting 'undefined' to be false");
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (matcherFunction: Function, createFunction: Function) => {
                    expect(matcherFunction({expectToBeFalsy: true})).toBeTruthy();
                    expect(matcherFunction({expect: true})).toBeFalsy();
                    expect(createFunction()).toBeInstanceOf(ExpectToBeFalsyAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
