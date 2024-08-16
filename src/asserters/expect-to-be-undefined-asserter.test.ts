import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeUndefinedAsserter} from './expect-to-be-undefined-asserter';

describe('ExpectToBeUndefinedAsserter', () => {
    it('should be undefined', () => {
        const assertion: Assertion = {
            name: 'assertion 0'
        };

        const literal = {
            name: 'body.name',
            expectToBeUndefined: 'body.expected'
        };

        const test = new ExpectToBeUndefinedAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should not be undefined', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expectToBeUndefined: 2
        };

        const literal = {
            name: 'body.name',
            expectToBeUndefined: 'body.expected'
        };

        const test = new ExpectToBeUndefinedAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting 'body.expected' to be undefined. Received: 2");
    });

    it('Should export an entry point', (done) => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: object, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        expectToBeUndefined: {
                            description: 'value expected to be undefined'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeUndefinedAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });
});
