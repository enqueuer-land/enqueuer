import { entryPoint, ExpectToBeAnyOfAsserter } from './expect-to-be-any-of-asserter';
import { Assertion } from '../models/events/assertion';
import { MainInstance } from '../plugins/main-instance';

describe('ExpectToBeAnyOfAsserter', () => {
  it('should compare equal primitives', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: 'equal',
      toBeAnyOf: [1, 'equal', 3]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
    expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
    expect(expectToBeEqualToAsserter.valid).toBeTruthy();
  });

  it('should compare not equal primitives', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: 2,
      not: null,
      toBeAnyOf: [0, 1]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
    expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
    expect(expectToBeEqualToAsserter.valid).toBeTruthy();
    expect(expectToBeEqualToAsserter.description).toBe(
      `Expected 'body.actual' not to be any of '[0, 1]'. Received '2'`
    );
  });

  it('should compare equal primitives fail', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: 2,
      toBeAnyOf: [3]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
    expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
    expect(expectToBeEqualToAsserter.valid).toBeFalsy();
    expect(expectToBeEqualToAsserter.description).toBeDefined();
  });

  it('should compare equal objects', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: { value: 123, cycle: { nested: true, array: [4, 3, 2] } },
      toBeAnyOf: [1, { value: 123, cycle: { nested: true, array: [4, 3, 2] } }]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
    expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
    expect(expectToBeEqualToAsserter.valid).toBeTruthy();
  });

  it('should compare equal objects reordering keys', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: {
        cycle: {
          nested: true,
          array: [4, 3, 2]
        },
        value: 123
      },
      toBeAnyOf: [
        0,
        'string',
        {
          value: 123,
          cycle: {
            nested: true,
            array: [4, 3, 2]
          }
        }
      ]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
    expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
    expect(expectToBeEqualToAsserter.valid).toBeTruthy();
  });

  it('should compare not equal objects', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: { value: 123, cycle: { nested: true, array: [4, 3, 2] } },
      not: null,
      toBeAnyOf: ['string', { value: 123, cycle: { nested: true } }]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
    expect(expectToBeEqualToAsserter.name).toBe('assertion 0');
    expect(expectToBeEqualToAsserter.valid).toBeTruthy();
    expect(expectToBeEqualToAsserter.description).toBeDefined();
  });

  it('should compare equal objects fail', () => {
    const assertion: Assertion = {
      name: 'assertion 0',
      expect: { value: 123, cycle: { nested: true, array: [4, 3, 2] } },
      toBeAnyOf: [{ value: 123, cycle: { nested: false, array: [4, 3, 2] } }]
    };

    const literal = {
      name: 'body.name',
      expect: 'body.actual',
      toBeAnyOf: 'body.expected'
    };

    const expectToBeEqualToAsserter = new ExpectToBeAnyOfAsserter().assert(assertion, literal);
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
            expect: {
              description: 'actual value',
              type: 'number'
            },
            toBeAnyOf: {
              type: 'list',
              description: 'expected value'
            },
            not: {
              required: false,
              description: 'negates',
              type: 'null'
            }
          });
          expect(createFunction()).toBeInstanceOf(ExpectToBeAnyOfAsserter);
          done();
        }
      }
    };
    entryPoint(mainInstance);
  });
});
