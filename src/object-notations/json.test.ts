import {Json} from "./json";
import * as fs from "fs";

jest.mock("fs");
fs.readFileSync.mockImplementation(() => Buffer.from('{\n' +
    '  "firstLevel": {\n' +
    '    "secondLevel": "value"\n' +
    '  }\n' +
    '}'));


describe('Json', () => {

    test('should stringify', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const expected =    '{\n' +
            '  "firstLevel": {\n' +
            '    "secondLevel": "value"\n' +
            '  }\n' +
            '}';

        const stringified = new Json().stringify(value);

        expect(stringified).toBe(expected)
    });

    test('should stringify undefined objects', () => {
        const stringified = new Json().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const expected =    '{\n' +
                            '  "firstLevel": {\n' +
                            '    "secondLevel": {}\n' +
                            '  }\n' +
                            '}';

        const stringified = new Json().stringify(value);

        expect(stringified).toBe(expected)
    });

    test('should parse', () => {
        const value =   '{\n' +
            '  "firstLevel": {\n' +
            '    "secondLevel": "value"\n' +
            '  }\n' +
            '}';
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new Json().parse(value);

        expect(parsed).toEqual(expected)
    });

    test('should load from file', () => {
        const expected = {firstLevel: {secondLevel: 'value'}};

        const loaded = new Json().loadFromFileSync('bla');

        expect(loaded).toEqual(expected)
    });

});