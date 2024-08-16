import { Assertion } from '../models/events/assertion';
import { MainInstance } from '../plugins/main-instance';
import { entryPoint, ExpectToBeLessThanOrEqualToAsserter } from './expect-to-be-less-than-or-equal-to-asserter';

describe('ExpectToBeLessThanOrEqualToAsserter', () => {
    it('should compare less', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 1,
            toBeLessThanOrEqualTo: 2
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeLessThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should compare not less', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 1,
            not: null,
            toBeLessThanOrEqualTo: 2
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeLessThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expected 'body.actual' not to be less than or equal to '2'. Received '1'");
    });

    it('should compare equal', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 3,
            toBeLessThanOrEqualTo: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeLessThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should compare less false', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 4,
            toBeLessThanOrEqualTo: 3
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeLessThanOrEqualTo: 'body.expected'
        };

        const test = new ExpectToBeLessThanOrEqualToAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expected 'body.actual' to be less than or equal to '3'. Received '4'");
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: object, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        expect: {
                            description: 'actual value',
                            type: 'number'
                        },
                        toBeLessThanOrEqualTo: {
                            description: 'expected value',
                            type: 'number'
                        },
                        not: {
                            required: false,
                            description: 'negates',
                            type: 'null'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeLessThanOrEqualToAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });
});
