import {YamlObjectNotation} from "./yaml-object-notation";

describe('YamlObjectNotation', () => {

    test('should stringify', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const expected =    "firstLevel:\n" +
                            "  secondLevel: value\n";

        const stringified = new YamlObjectNotation().stringify(value);

        expect(stringified).toBe(expected)
    });

    test('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const expected =    "firstLevel:\n" +
                            "  secondLevel: {}\n";

        const stringified = new YamlObjectNotation().stringify(value);

        expect(stringified).toBe(expected)
    });

    test('should parse', () => {
        const value =    "firstLevel:\n" +
                         "  secondLevel: value\n";
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new YamlObjectNotation().parse(value);

        expect(parsed).toEqual(expected)
    });

});