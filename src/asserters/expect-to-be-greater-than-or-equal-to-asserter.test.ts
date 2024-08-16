import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeGreaterThanOrEqualToAsserter} from './expect-to-be-greater-than-or-equal-to-asserter';

describe('ExpectToBeGreaterThanOrEqualToAsserter', () => {
    it('should compare greater', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 3,
            toBeGreaterThanOrEqualTo: 2
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeGreaterThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should compare not greater', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 3,
            not: null,
            toBeGreaterThanOrEqualTo: 4
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeGreaterThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
        expect(test.description).toBe("Expected 'body.actual' not to be greater than or equal to '4'. Received '3'");
    });

    it('should compare equal', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 3,
            toBeGreaterThanOrEqualTo: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeGreaterThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should compare greater fail', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            toBeGreaterThanOrEqualTo: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeGreaterThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expected 'body.actual' to be greater than or equal to '3'. Received '2'");
    });

    it('Should export an entry point', (done) => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: object, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        expect: {
                            description: 'actual value',
                            type: 'number'
                        },
                        toBeGreaterThanOrEqualTo: {
                            description: 'expected value',
                            type: 'number'
                        },
                        not: {
                            required: false,
                            description: 'negates',
                            type: 'null'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeGreaterThanOrEqualToAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });
});
