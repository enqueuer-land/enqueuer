import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeFalsyAsserter} from './expect-to-be-falsy-asserter';
import {AssertionTemplate} from '../plugins/asserter-manager';

describe('ExpectToBeFalsyAsserter', () => {
    it('should be falsy', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expectToBeFalsy: false,
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
        expect(test.description).toBe("Expecting 'body.expected' to be false");
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: AssertionTemplate, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        expectToBeFalsy: {
                            'description':
                                'value expected to be false'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeFalsyAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
