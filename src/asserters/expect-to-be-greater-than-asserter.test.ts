import {Assertion} from '../models/events/assertion';
import {MainInstance} from '../plugins/main-instance';
import {entryPoint, ExpectToBeGreaterThanAsserter} from './expect-to-be-greater-than-asserter';

describe('ExpectToBeGreaterThanAsserter', () => {
    it('should compare greater', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 3,
            toBeGreaterThan: 2,
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThan: 'body.expected',
        };

        const test = new ExpectToBeGreaterThanAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
    });

    it('should compare not greater', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 3,
            not: null,
            toBeGreaterThan: 4,
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThan: 'body.expected',
        };

        const test = new ExpectToBeGreaterThanAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeTruthy();
        expect(test.valid).toBeDefined();
    });

    it('should compare greater fail', () => {

        const assertion: Assertion = {
            name: 'assertion 0',
            expect: 2,
            toBeGreaterThan: 3,
        };

        const literal = {
            name: 'body.name',
            expect: 'body.actual',
            toBeGreaterThan: 'body.expected',
        };

        const test = new ExpectToBeGreaterThanAsserter().assert(assertion, literal);
        expect(test.name).toBe('assertion 0');
        expect(test.valid).toBeFalsy();
        expect(test.description).toBe("Expected 'body.actual' not to be greater than '3'. Received '2'");
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
                        'toBeGreaterThan': {
                            'description': 'expected value',
                            'type': 'number'
                        }, not: {
                            required: false,
                            description: 'negates',
                            type: 'null'
                        }
                    });
                    expect(createFunction()).toBeInstanceOf(ExpectToBeGreaterThanAsserter);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
