import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';
import { Asserter } from './asserter';
import { MainInstance } from '../plugins/main-instance';

export class ExpectToBeGreaterThanAsserter implements Asserter {
  public assert(assertion: Assertion, literal: any): TestModel {
    const actual = assertion.expect;
    const expected = assertion.toBeGreaterThan;

    return {
      name: assertion.name,
      valid: assertion.not === undefined ? actual > expected : actual <= expected,
      description: `Expected '${literal.expect}'${assertion.not === undefined ? ' not' : ''} to be greater than '${expected}'. Received '${actual}'`
    };
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  mainInstance.asserterManager.addAsserter(
    {
      expect: {
        type: 'number',
        description: 'actual value'
      },
      not: {
        required: false,
        description: 'negates',
        type: 'null'
      },
      toBeGreaterThan: {
        type: 'number',
        description: 'expected value'
      }
    },
    () => new ExpectToBeGreaterThanAsserter()
  );
}
