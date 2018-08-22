import {Tester} from "./tester";

describe('Tester', () => {

    it(`Report is empty when initialized`, () => {
        const tester: Tester = new Tester;

        expect(tester.getReport().length).toBe(0);
    });

    it(`isNotEqualTo`, () => {
        const tester: Tester = new Tester;

        tester.toBeEqualTo(`label`, 3, 5);

        const isNotEqualTo = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotEqualTo.label).toBe(`label`);
        expect(isNotEqualTo.valid).toBeFalsy();
        expect(isNotEqualTo.errorDescription).toEqual("Expected value to be equal to '5'. Received '3'");
    });

    it(`isEqualTo`, () => {
        const tester: Tester = new Tester;

        tester.toBeEqualTo(`label`, 3, 3);

        const equalTo = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(equalTo.label).toBe(`label`);
        expect(equalTo.valid).toBeTruthy();
    });

    it(`isNotGreaterThan`, () => {
        const tester: Tester = new Tester;

        tester.toBeGreaterThan(`label`, 3, 3);

        const isNotGreaterThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotGreaterThan.label).toBe(`label`);
        expect(isNotGreaterThan.valid).toBeFalsy();
        expect(isNotGreaterThan.errorDescription).toEqual("Expected value to be greater than '3'. Received '3'");
    });

    it(`isGreaterThan`, () => {
        const tester: Tester = new Tester;

        tester.toBeGreaterThan(`label`, 5, 3);

        const isGreaterThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isGreaterThan.label).toBe(`label`);
        expect(isGreaterThan.valid).toBeTruthy();
    });

    it(`isNotGreaterThanOrEqualTo`, () => {
        const tester: Tester = new Tester;

        tester.toBeGreaterThanOrEqualTo(`label`, 3, 4);

        const isNotGreaterThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotGreaterThanOrEqual.label).toBe(`label`);
        expect(isNotGreaterThanOrEqual.valid).toBeFalsy();
        expect(isNotGreaterThanOrEqual.errorDescription).toEqual("Expected value to be greater than or equal to '4'. Received '3'");
    });

    it(`isGreaterThanOrEqualTo`, () => {
        const tester: Tester = new Tester;

        tester.toBeGreaterThanOrEqualTo(`label`, 5, 5);

        const isGreaterThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isGreaterThanOrEqual.label).toBe(`label`);
        expect(isGreaterThanOrEqual.valid).toBeTruthy();
    });

    it(`isNotLessThan`, () => {
        const tester: Tester = new Tester;

        tester.toBeLessThan(`label`, 4, 3);

        const isNotLessThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotLessThan.label).toBe(`label`);
        expect(isNotLessThan.valid).toBeFalsy();
        expect(isNotLessThan.errorDescription).toEqual(  "Expected value to be less than '3'. Received '4'"
        );
    });

    it(`isLessThan`, () => {
        const tester: Tester = new Tester;

        tester.toBeLessThan(`label`, 1, 3);

        const isLessThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isLessThan.label).toBe(`label`);
        expect(isLessThan.valid).toBeTruthy();
    });

    it(`isNotLessThanOrEqualTo`, () => {
        const tester: Tester = new Tester;

        tester.toBeLessThanOrEqualTo(`label`, 5, 4);

        const isNotLessThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotLessThanOrEqual.label).toBe(`label`);
        expect(isNotLessThanOrEqual.valid).toBeFalsy();
        expect(isNotLessThanOrEqual.errorDescription).toEqual("Expected value to be less than or equal to '4'. Received '5'");
    });

    it(`isLessThanOrEqualTo`, () => {
        const tester: Tester = new Tester;

        tester.toBeLessThanOrEqualTo(`label`, 5, 5);

        const isLessThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isLessThanOrEqual.label).toBe(`label`);
        expect(isLessThanOrEqual.valid).toBeTruthy();
    });

    it(`isNotTruthy`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeTruthy(`label`, false);

        const isNotTruthy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotTruthy.label).toBe(`label`);
        expect(isNotTruthy.valid).toBeFalsy();
        expect(isNotTruthy.errorDescription).toEqual(`'${false}' is not true. I swear`);
    });

    it(`isTruthy`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeTruthy(`label`, true);

        const isTruthy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isTruthy.label).toBe(`label`);
        expect(isTruthy.valid).toBeTruthy();
    });

    it(`isNotFalsy`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeFalsy(`label`, true);

        const isNotFalsy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotFalsy.label).toBe(`label`);
        expect(isNotFalsy.valid).toBeFalsy();
        expect(isNotFalsy.errorDescription).toEqual(`'${true}' is not false. (Oh really?)`);
    });

    it(`isFalsy`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeFalsy(`label`, false);

        const isFalsy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isFalsy.label).toBe(`label`);
        expect(isFalsy.valid).toBeTruthy();
    });

    it(`notContains`, () => {
        const tester: Tester = new Tester;

        tester.toContain(`label`, "guigui", `virgs`);

        const notContains = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(notContains.label).toBe(`label`);
        expect(notContains.valid).toBeFalsy();
        expect(notContains.errorDescription).toEqual(`'guigui' does not contain 'virgs'`);
    });

    it(`contains`, () => {
        const tester: Tester = new Tester;

        tester.toContain(`label`, "guigui", `ig`);

        const contains = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(contains.label).toBe(`label`);
        expect(contains.valid).toBeTruthy();
    });

    it(`isNotDefined`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeDefined(`label`, undefined);
        const isNotDefined = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(isNotDefined.label).toBe(`label`);
        expect(isNotDefined.valid).toBeFalsy();
        expect(isNotDefined.errorDescription).toEqual(`'undefined' is not defined`);
    });

    it(`isDefined`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeDefined(`label`, "value");
        const isDefined = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(isDefined.label).toBe(`label`);
        expect(isDefined.valid).toBeTruthy();
    });

    it(`isNotUndefined`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeUndefined(`label`, 'value');
        const isNotUndefined = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(isNotUndefined.label).toBe(`label`);
        expect(isNotUndefined.valid).toBeFalsy();
        expect(isNotUndefined.errorDescription).toEqual(`'value' is not undefined`);
    });

    it(`isUndefined`, () => {
        const tester: Tester = new Tester;

        tester.expectToBeUndefined(`label`, undefined);
        const isUndefined = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(isUndefined.label).toBe(`label`);
        expect(isUndefined.valid).toBeTruthy();
    });

});

