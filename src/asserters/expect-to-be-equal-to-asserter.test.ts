import {entryPoint, ExpectToBeEqualToAsserter} from './expect-to-be-equal-to-asserter';
import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';

describe('ExpectToBeEqualToAsserter', () => {
    it('should compare equal primitives', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            toBeEqualTo: 2,
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeTruthy();
    });

    it('should compare not equal primitives', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            not: null,
            toBeEqualTo: 0,
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeTruthy();
        expect(expectToBeEqualToAsserter.description).toBe(`Expected 'body.actual' not to be equal to '0'. Received '2'`);
    });

    it('should compare equal primitives fail', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            toBeEqualTo: 3,
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeFalsy();
        expect(expectToBeEqualToAsserter.description).toBeDefined();
    });

    it('should compare equal objects', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect:         {value: 123, deep: {nested: true, array: [4, 3, 2]}},
            toBeEqualTo:    {value: 123, deep: {nested: true, array: [4, 3, 2]}},
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeTruthy();
    });

    it('should compare equal objects reordering keys', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: {
                deep: {
                    nested: true, array: [4, 3, 2]
                },
                value: 123,
            },
            toBeEqualTo: {
                value: 123,
                deep: {
                    nested: true, array: [4, 3, 2]
                }
            }
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeTruthy();
    });

    it('should compare not equal objects', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: {value: 123, deep: {nested: true, array: [4, 3, 2]}},
            not: null,
            toBeEqualTo: {value: 123, deep: {nested: true}},
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeTruthy();
        expect(expectToBeEqualToAsserter.description).toBeDefined();
    });

    it('should compare equal objects fail', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: {value: 123, deep: {nested: true, array: [4, 3, 2]}},
            toBeEqualTo: {value: 123, deep: {nested: false, array: [4, 3, 2]}},
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeEqualTo: 'body.expected',
        };

        const expectToBeEqualToAsserter = new ExpectToBeEqualToAsserter().assert(assertion, literal);
        expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
        expect(expectToBeEqualToAsserter.valid).toBeFalsy();
        expect(expectToBeEqualToAsserter.description).toBeDefined();
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            asserterManager: {
                addAsserter: (templateAssertion: object, createFunction: Function) => {
                    expect(templateAssertion).toEqual({
                        'expect': {
                            'description': 'actual value',
                            'type': 'number'
                        },
                        'toBeEqualTo': {
                            'description': 'expected value',
                            'type': 'number'
                        }, not: {
                            required: false,
                            description: 'negates',
                            type: 'null'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeEqualToAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

})
;
