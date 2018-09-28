import {MultipleObjectNotation} from "./multiple-object-notation";
import * as fs from "fs";

jest.mock("fs");
fs.readFileSync.mockImplementation(() => Buffer.from('{\n' +
    '  "firstLevel": {\n' +
    '    "secondLevel": "value"\n' +
    '  }\n' +
    '}'));

describe('MultipleObjectNotation', () => {

    test('should not stringify', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        expect(() => new MultipleObjectNotation().stringify(value)).toThrow();
    });

    test('should parse yml', () => {
        const value =    "firstLevel:\n" +
                         "  secondLevel: value\n";
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new MultipleObjectNotation().parse(value);

        expect(parsed).toEqual(expected)
    });

    test('should parse json', () => {
        const value =   '{\n' +
            '  "firstLevel": {\n' +
            '    "secondLevel": "value"\n' +
            '  }\n' +
            '}';
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new MultipleObjectNotation().parse(value);

        expect(parsed).toEqual(expected)
    });

    test('should load from file', () => {
        const expected = {firstLevel: {secondLevel: 'value'}};

        const loaded = new MultipleObjectNotation().loadFromFileSync('bla');

        expect(loaded).toEqual(expected)
    });

});