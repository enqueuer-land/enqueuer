import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';
import { Asserter } from './asserter';
import { MainInstance } from '../plugins/main-instance';

export class ExpectToBeEqualToAsserter implements Asserter {
    public assert(assertion: Assertion, literal: any): TestModel {
        const actual = assertion.expect;
        const expected = assertion.toBeEqualTo;

        if (typeof (actual) === 'object' && typeof (expected) === 'object') {
            const areEquals = this.deepEqual(actual, expected);
            return {
                name: assertion.name,
                valid: assertion.not === undefined ? areEquals : !areEquals,
                description: `Expected '${JSON.stringify(literal.expect, null, 2)}'${assertion.not === undefined ?
                    '' : ' not'} to be equal to '${JSON
                        .stringify(expected, null, 2)}'. Received '${JSON
                            .stringify(actual, null, 2)}'`
            };
        } else {
            return {
                name: assertion.name,
                valid: assertion.not === undefined ? actual == expected : actual != expected,
                description: `Expected '${literal.expect}'${assertion.not === undefined ?
                    '' : ' not'} to be equal to '${expected}'. Received '${actual}'`
            };
        }
    }

    private deepEqual(x: any, y: any): boolean {
        const ok = Object.keys, tx = typeof x, ty = typeof y;
        return x && y && tx === 'object' && tx === ty ? (
            ok(x).length === ok(y).length &&
            ok(x).every(key => this.deepEqual(x[key], y[key]))
        ) : (x === y && (x != null && y != null || x.constructor === y.constructor));
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    mainInstance.asserterManager.addAsserter(
        {
            expect: {
                type: 'number',
                description: 'actual value'
            }, not: {
                required: false,
                description: 'negates',
                type: 'null'
            }, toBeEqualTo: {
                type: 'number',
                description: 'expected value'
            }
        },
        () => new ExpectToBeEqualToAsserter());
}
