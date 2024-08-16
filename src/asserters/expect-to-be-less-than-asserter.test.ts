import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeLessThanAsserter} from './expect-to-be-less-than-asserter';
import {AssertionTemplate} from '../plugins/asserter-manager';

describe('ExpectToBeLessThanAsserter', () => {
    it('should compare less', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 1,
            toBeLessThan: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThan: 'body.expected'
        };

        const test = new ExpectToBeLessThanAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should compare not less', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 4,
            not: null,
            toBeLessThan: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThan: 'body.expected'
        };

        const test = new ExpectToBeLessThanAsserter().assert(assertion, literal);
        expect(test.valid).toBeTruthy();
    });

    it('should compare less fail', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 4,
            toBeLessThan: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThan: 'body.expected'
        };

        const test = new ExpectToBeLessThanAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expected 'body.actual' to be less than '3'. Received '4'");
    });

    it('should compare not less fail', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            not: null,
            toBeLessThan: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThan: 'body.expected'
        };

        const test = new ExpectToBeLessThanAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expected 'body.actual' not to be less than '3'. Received '2'");
    });

    it('Should export an entry point', (done) => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: AssertionTemplate, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        expect: {
                            type: 'number',
                            description: 'actual value'
                        },
                        toBeLessThan: {
                            type: 'number',
                            description: 'expected value'
                        },
                        not: {
                            required: false,
                            description: 'negates',
                            type: 'null'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeLessThanAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });
});
