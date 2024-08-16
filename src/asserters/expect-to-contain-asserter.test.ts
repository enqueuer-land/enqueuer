import {ExpectToContainAsserter, entryPoint} from './expect-to-contain-asserter';
import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';

describe('ExpectToContainAsserter', () => {
    it('should contain char in string', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 'enqueuer',
            toContain: 'e'
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should not contain char in string', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 'enqueuer',
            not: null,
            toContain: 'y'
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.valid).toBeTruthy();
        expect(test.description).toBe("Expecting 'enqueuer' (body.actual) not to contain 'y'");
    });

    it('should handle contain with different types', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 'enqueuer',
            toContain: 4
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting 'toContain' to be a 'string'. Received a 'number' instead");
    });

    it('should contain char in array', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: [0, 'enqueuer', true],
            toContain: true
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should not contain element in array', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: [0, 'enqueuer', true],
            not: 'null',
            toContain: 'y'
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
        expect(test.description).toBe("Expecting '0,enqueuer,true' (body.actual) not to contain 'y'");
    });

    it('should contain element in string fail', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: [0, 'enqueuer', true],
            toContain: false
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting '0,enqueuer,true' (body.actual) to contain 'false'");
    });

    it('should handle contain with type being not string nor array', () => {
        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 7,
            toContain: 4
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toContain: 'body.expected'
        };

        const test = new ExpectToContainAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expecting 'body.actual' to be a string or an array. Received a 'number'");
    });

    it('Should export an entry point', (done) => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: object, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        expect: {
                            description: 'actual value',
                            type: ['string', 'array']
                        },
                        toContain: {
                            description: 'element',
                            type: ['string', 'any']
                        },
                        not: {
                            required: false,
                            description: 'negates',
                            type: 'null'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToContainAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });
});
