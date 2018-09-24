import {DelimiterSeparatedValueObjectNotation} from "./delimiter-separated-value-object-notation";
import * as fs from "fs";

jest.mock("fs");
describe('DelimiterSeparatedValueObjectNotation', () => {

    test('should stringify undefined objects', () => {
        const stringified = new DelimiterSeparatedValueObjectNotation().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should parse empty objects', () => {
        const stringified = new DelimiterSeparatedValueObjectNotation().parse({});

        expect(stringified).toEqual([]);
    });

    test('should parse empty lines', () => {
        const stringified = new DelimiterSeparatedValueObjectNotation().parse('\n');

        expect(stringified).toEqual([]);
    });

    test('should parse with ; and header as default', () => {
        const value = 'title1;title2;title3\n' +
            'a1;a2;a3\n' +
            'b1;b2;b3\r\n';
        const expected = [
            {"title1": "a1", "title2": "a2", "title3": "a3"},
            {"title1": "b1", "title2": "b2", "title3": "b3"}];

        const parsed = new DelimiterSeparatedValueObjectNotation().parse(value);

        expect(parsed).toEqual(expected)
    });

    test('should parse with given delimiter and no header as default', () => {
        const value = 'a1.a2.a3\r\n' +
            'b1.b2.b3';
        const expected = [
            ["a1", "a2", "a3"],
            ["b1", "b2", "b3"]];

        const parsed = new DelimiterSeparatedValueObjectNotation('.', false).parse(value);

        expect(parsed).toEqual(expected)
    });

    test('should stringify with default header (true) and delimiter (;) value', () => {
        const value = [
            {"title1": "a1", "title2": "a2", "title3": "a3"},
            {"title1": "b1", "title2": "b2", "title3": "b3"}];
        const expected = "title1;title2;title3\r\n\
a1;a2;a3\r\n\
b1;b2;b3";

        const parsed = new DelimiterSeparatedValueObjectNotation().stringify(value);

        expect(parsed).toEqual(expected)
    });

    test('should stringify with header (false) and delimiter (\t) value and numbers', () => {
        const value = [
            [0, 1, false],
            ["b1", "b2", "b3"]];

        const expected = "0\t1\tfalse\r\n\
b1\tb2\tb3";

        const parsed = new DelimiterSeparatedValueObjectNotation('\t', false).stringify(value);

        expect(parsed).toEqual(expected)
    });

    test('should stringify cycle reference', () => {
        const value: any = [["00"]];
        value[0][0] = value;


        const stringified = new DelimiterSeparatedValueObjectNotation(';', false).stringify(value);

        expect(stringified).toBe("[CYCLIC REFERENCE]");
    });

    test('should load from file', () => {
        const fileContent = 'id;name;author\n' +
            '1;john lennon;father\r\n' +
            '2;paul mccartney;mother\r\n';
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));

        const expected = [
            {
                "author": "father",
                "id": "1",
                "name": "john lennon"},
            {
                "author": "mother",
                "id": "2",
                "name": "paul mccartney"
            }];

        const loaded = new DelimiterSeparatedValueObjectNotation().loadFromFileSync(fileContent);

        expect(loaded).toEqual(expected)
    });

});