import {Yaml} from "./yaml";

describe('Yaml', () => {

    test('should stringify', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const expected =    "firstLevel:\n" +
                            "  secondLevel: value\n";

        const stringified = new Yaml().stringify(value);

        expect(stringified).toBe(expected)
    });

    test('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const expected =    "firstLevel:\n" +
                            "  secondLevel: {}\n";

        const stringified = new Yaml().stringify(value);

        expect(stringified).toBe(expected)
    });

    test('should stringify undefined objects', () => {
        const stringified = new Yaml().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should parse', () => {
        const value =    "firstLevel:\n" +
                         "  secondLevel: value\n";
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new Yaml().parse(value);

        expect(parsed).toEqual(expected)
    });

});