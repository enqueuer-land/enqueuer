import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';
import { Asserter } from './asserter';
import { MainInstance } from '../plugins/main-instance';

export class ExpectToBeAnyOfAsserter implements Asserter {
  public assert(assertion: Assertion, literal: any): TestModel {
    const actual = assertion.expect;
    const isAnyOfList = assertion.toBeAnyOf.some((expected: string) => this.checkEquality(expected, actual));

    return {
      name: assertion.name,
      valid: assertion.not === undefined ? isAnyOfList : !isAnyOfList,
      description: `Expected '${literal.expect}'${
        assertion.not === undefined ? '' : ' not'
      } to be any of '[${assertion.toBeAnyOf.join(', ')}]'. Received '${actual}'`
    };
  }

  private checkEquality(expected: string, actual: string): boolean {
    if (typeof actual === 'object' && typeof expected === 'object') {
      return this.deepEqual(actual, expected);
    } else {
      return actual == expected;
    }
  }

  private deepEqual(x: any, y: any): boolean {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y;
    return x && y && tx === 'object' && tx === ty
      ? ok(x).length === ok(y).length && ok(x).every(key => this.deepEqual(x[key], y[key]))
      : x === y && ((x != null && y != null) || x.constructor === y.constructor);
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
      toBeAnyOf: {
        type: 'list',
        description: 'expected value'
      }
    },
    () => new ExpectToBeAnyOfAsserter()
  );
}
