import {Csv} from './csv';
import * as fs from 'fs';

jest.mock('fs');
describe('Csv', () => {

    test('should stringify undefined objects', () => {
        const stringified = new Csv().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should parse empty objects', () => {
        const stringified = new Csv().parse({});

        expect(stringified).toEqual([]);
    });

    test('should parse empty lines', () => {
        const stringified = new Csv().parse('\n');

        expect(stringified).toEqual([]);
    });

    test('should parse with ; and header as default', () => {
        const value = 'title1;title2;title3\n' +
            'a1;a2;a3\n' +
            'b1;b2;b3\r\n';
        const expected = [
            {'title1': 'a1', 'title2': 'a2', 'title3': 'a3'},
            {'title1': 'b1', 'title2': 'b2', 'title3': 'b3'}];

        const parsed = new Csv().parse(value);

        expect(parsed).toEqual(expected);
    });

    test('should parse tsv', () => {
        const value = 'a1\ta2\ta3\r\n' +
            'b1\tb2\tb3';
        const expected = [
            ['a1', 'a2', 'a3'],
            ['b1', 'b2', 'b3']];

        const parsed = new Csv('tsv').parse(value);

        expect(parsed).toEqual(expected);
    });

    test('should stringify with default header', () => {
        const value = [
            {'title1': 'a1', 'title2': 'a2', 'title3': 'a3'},
            {'title1': 'b1', 'title2': 'b2', 'title3': 'b3'}];
        const expected = 'title1;title2;title3\r\n\
a1;a2;a3\r\n\
b1;b2;b3';

        const parsed = new Csv().stringify(value);

        expect(parsed).toEqual(expected);
    });

    test('should stringify with header (false) and delimiter (\t) value and numbers', () => {
        const value = [
            [0, 1, false],
            ['b1', 'b2', 'b3']];

        const expected = '0\t1\tfalse\r\n\
b1\tb2\tb3';

        const parsed = new Csv('tsv').stringify(value);

        expect(parsed).toEqual(expected);
    });

    test('should stringify cycle reference', () => {
        const value: any = [['00']];
        value[0][0] = value;

        const stringified = new Csv('csv').stringify(value);

        expect(stringified).toBe('[CYCLIC REFERENCE]');
    });

    test('should load from file', () => {
        const fileContent = 'id;name;author\n' +
            '1;john lennon;father\r\n' +
            '2;paul mccartney;mother\r\n';
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));

        const expected = [
            {
                'author': 'father',
                'id': '1',
                'name': 'john lennon'},
            {
                'author': 'mother',
                'id': '2',
                'name': 'paul mccartney'
            }];

        const loaded = new Csv().loadFromFileSync(fileContent);

        expect(loaded).toEqual(expected);
    });

});
