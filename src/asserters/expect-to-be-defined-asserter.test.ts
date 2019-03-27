import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeDefinedAsserter} from './expect-to-be-defined-asserter';

describe('ExpectToBeDefinedAsserter', () => {
    it('should be defined', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expectToBeDefined: 2,
        };

        const literal = {
            name: 'body.name',
            expectToBeDefined: 'body.expected',
        };

        const test = new ExpectToBeDefinedAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should not be defined', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
        };

        const literal = {
            name: 'body.name',
            expectToBeDefined: 'body.expected',
        };

        const test = new ExpectToBeDefinedAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting 'body.expected' to be defined");
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: object, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        'expectToBeDefined': {
                            'description': 'stuff to be defined'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeDefinedAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
