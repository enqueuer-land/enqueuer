import {Yaml} from './yaml';
import {Injectable} from 'conditional-injector';
jest.mock('conditional-injector');
// @ts-ignore
Injectable.mockImplementation();

describe('Yaml', () => {

    it('should inject properly', () => {
        expect(Injectable).toBeCalled();
        // @ts-ignore
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate('YML')).toBeTruthy();
        expect(injectableOption.predicate('YaML')).toBeTruthy();
        expect(injectableOption.predicate('yMl')).toBeTruthy();
        expect(injectableOption.predicate('yAMl')).toBeTruthy();
        expect(injectableOption.predicate('notYml')).toBeFalsy();
        // @ts-ignore
        Injectable.mockClear();
    });

    test('should stringify', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const expected =    'firstLevel:\n' +
                            '  secondLevel: value\n';

        const stringified = new Yaml().stringify(value);

        expect(stringified).toBe(expected);
    });

    test('should keep string numbers as string', () => {
        const value =    'firstLevel:\n' +
            "  secondLevel: '123.00'\n";

        const parsed: any = new Yaml().parse(value);

        expect(typeof parsed.firstLevel.secondLevel).toEqual('string');
        expect(parsed.firstLevel.secondLevel).toEqual('123.00');
    });

    test('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const expected =    'firstLevel:\n' +
                            '  secondLevel: {}\n';

        const stringified = new Yaml().stringify(value);

        expect(stringified).toBe(expected);
    });

    test('should stringify undefined objects', () => {
        // @ts-ignore
        const stringified = new Yaml().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should parse', () => {
        const value =    'firstLevel:\n' +
                         '  secondLevel: value\n';
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new Yaml().parse(value);

        expect(parsed).toEqual(expected);
    });

});
