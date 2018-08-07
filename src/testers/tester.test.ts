import {Tester} from "./tester";

describe('Tester', () => {

it('Report is empty when initialized', () => {
        const tester: Tester = new Tester;

        expect(tester.getReport().length).toBe(0);
    });

    it('isNotEqualTo', () => {
        const tester: Tester = new Tester;

        tester.isEqualTo('label', 3, 5);

        const isNotEqualTo = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotEqualTo.label).toBe('label');
        expect(isNotEqualTo.valid).toBeFalsy();
        expect(isNotEqualTo.description).toEqual('3 is not equal to 5');
    });

    it('isEqualTo', () => {
        const tester: Tester = new Tester;

        tester.isEqualTo('label', 3, 3);

        const equalTo = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(equalTo.label).toBe('label');
        expect(equalTo.valid).toBeTruthy();
        expect(equalTo.description).toEqual('3 is equal to 3');
    });

    it('isNotGreaterThan', () => {
        const tester: Tester = new Tester;

        tester.isGreaterThan('label', 3, 3);

        const isNotGreaterThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotGreaterThan.label).toBe('label');
        expect(isNotGreaterThan.valid).toBeFalsy();
        expect(isNotGreaterThan.description).toEqual('3 is not greater than 3');
    });

    it('isGreaterThan', () => {
        const tester: Tester = new Tester;

        tester.isGreaterThan('label', 5, 3);

        const isGreaterThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isGreaterThan.label).toBe('label');
        expect(isGreaterThan.valid).toBeTruthy();
        expect(isGreaterThan.description).toEqual('5 is greater than 3');
    });

    it('isNotGreaterThanOrEqualTo', () => {
        const tester: Tester = new Tester;

        tester.isGreaterThanOrEqualTo('label', 3, 4);

        const isNotGreaterThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotGreaterThanOrEqual.label).toBe('label');
        expect(isNotGreaterThanOrEqual.valid).toBeFalsy();
        expect(isNotGreaterThanOrEqual.description).toEqual('3 is not greater than or equal to 4');
    });

    it('isGreaterThanOrEqualTo', () => {
        const tester: Tester = new Tester;

        tester.isGreaterThanOrEqualTo('label', 5, 5);

        const isGreaterThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isGreaterThanOrEqual.label).toBe('label');
        expect(isGreaterThanOrEqual.valid).toBeTruthy();
        expect(isGreaterThanOrEqual.description).toEqual('5 is greater than or equal to 5');
    });

    it('isNotLessThan', () => {
        const tester: Tester = new Tester;

        tester.isLessThan('label', 4, 3);

        const isNotLessThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotLessThan.label).toBe('label');
        expect(isNotLessThan.valid).toBeFalsy();
        expect(isNotLessThan.description).toEqual('4 is not less than 3');
    });

    it('isLessThan', () => {
        const tester: Tester = new Tester;

        tester.isLessThan('label', 1, 3);

        const isLessThan = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isLessThan.label).toBe('label');
        expect(isLessThan.valid).toBeTruthy();
        expect(isLessThan.description).toEqual('1 is less than 3');
    });

    it('isNotLessThanOrEqualTo', () => {
        const tester: Tester = new Tester;

        tester.isLessThanOrEqualTo('label', 5, 4);

        const isNotLessThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotLessThanOrEqual.label).toBe('label');
        expect(isNotLessThanOrEqual.valid).toBeFalsy();
        expect(isNotLessThanOrEqual.description).toEqual('5 is not less than or equal to 4');
    });

    it('isLessThanOrEqualTo', () => {
        const tester: Tester = new Tester;

        tester.isLessThanOrEqualTo('label', 5, 5);

        const isLessThanOrEqual = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isLessThanOrEqual.label).toBe('label');
        expect(isLessThanOrEqual.valid).toBeTruthy();
        expect(isLessThanOrEqual.description).toEqual('5 is less than or equal to 5');
    });

    it('isNotTruthy', () => {
        const tester: Tester = new Tester;

        tester.isTruthy('label', false);

        const isNotTruthy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotTruthy.label).toBe('label');
        expect(isNotTruthy.valid).toBeFalsy();
        expect(isNotTruthy.description).toEqual(`${false} is not true. I swear`);
    });

    it('isTruthy', () => {
        const tester: Tester = new Tester;

        tester.isTruthy('label', true);

        const isTruthy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isTruthy.label).toBe('label');
        expect(isTruthy.valid).toBeTruthy();
        expect(isTruthy.description).toEqual('Definitely true');
    });

    it('isNotFalsy', () => {
        const tester: Tester = new Tester;

        tester.isFalsy('label', true);

        const isNotFalsy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isNotFalsy.label).toBe('label');
        expect(isNotFalsy.valid).toBeFalsy();
        expect(isNotFalsy.description).toEqual(`${true} is not false. (Oh really?)`);
    });

    it('isFalsy', () => {
        const tester: Tester = new Tester;

        tester.isFalsy('label', false);

        const isFalsy = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(isFalsy.label).toBe('label');
        expect(isFalsy.valid).toBeTruthy();
        expect(isFalsy.description).toEqual('Definitely false');
    });

    it('notContains', () => {
        const tester: Tester = new Tester;

        tester.contains('label', "guigui", 'virgs');

        const notContains = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(notContains.label).toBe('label');
        expect(notContains.valid).toBeFalsy();
        expect(notContains.description).toEqual(`'guigui' does not contain 'virgs'`);
    });

    it('contains', () => {
        const tester: Tester = new Tester;

        tester.contains('label', "guigui", 'ig');

        const contains = tester.getReport()[0];
        expect(tester.getReport().length).toBe(1);
        expect(contains.label).toBe('label');
        expect(contains.valid).toBeTruthy();
        expect(contains.description).toEqual(`'guigui' contains 'ig'`);
    });

    it('isNotDefined', () => {
        const tester: Tester = new Tester;

        tester.isDefined('label', undefined);
        const isNotDefined = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(isNotDefined.label).toBe('label');
        expect(isNotDefined.valid).toBeFalsy();
        expect(isNotDefined.description).toEqual(`'undefined' is not defined`);
    });

    it('isDefined', () => {
        const tester: Tester = new Tester;

        tester.isDefined('label', "value");
        const isDefined = tester.getReport()[0];

        expect(tester.getReport().length).toBe(1);
        expect(isDefined.label).toBe('label');
        expect(isDefined.valid).toBeTruthy();
        expect(isDefined.description).toEqual(`'value' is defined`);
    });

});

