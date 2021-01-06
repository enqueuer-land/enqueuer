import {CsvObjectParser, entryPoint} from './csv-object-parser';
import {MainInstance} from '../plugins/main-instance';

describe('CsvObjectParser', () => {

    test('should stringify undefined objects', () => {
        const stringified = new CsvObjectParser().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should parse empty objects', () => {
        // @ts-expect-error
        const stringified = new CsvObjectParser().parse({}, {});

        expect(stringified).toEqual([]);
    });

    test('should parse empty lines', () => {
        const stringified = new CsvObjectParser().parse('\n', {});

        expect(stringified).toEqual([]);
    });

    test('should parse with ; and header as default', () => {
        const value = 'title1;title2;title3\n' +
            'a1;a2;a3\n' +
            'b1;b2;b3\r\n';
        const expected = [
            {'title1': 'a1', 'title2': 'a2', 'title3': 'a3'},
            {'title1': 'b1', 'title2': 'b2', 'title3': 'b3'}];

        const parsed = new CsvObjectParser().parse(value);

        expect(parsed).toEqual(expected);
    });

    test('should parse tsv', () => {
        const value = 'a1\ta2\ta3\r\n' +
            'b1\tb2\tb3';
        const expected = [
            ['a1', 'a2', 'a3'],
            ['b1', 'b2', 'b3']];

        const parsed = new CsvObjectParser().parse(value, {delimiter: '\t', header: false});

        expect(parsed).toEqual(expected);
    });

    test('should stringify with header (false) and delimiter (\t) value and numbers', () => {
        const value = [
            [0, 1, false],
            ['b1', 'b2', 'b3']];

        const expected = '0\t1\tfalse\r\n\
b1\tb2\tb3';

        const parsed = new CsvObjectParser().stringify(value, {delimiter: '\t', header: false});

        expect(parsed).toEqual(expected);
    });

    test('should stringify cycle reference', () => {
        const value: any = [['00']];
        value[0][0] = value;

        const stringified = new CsvObjectParser().stringify(value, {header: false});

        expect(stringified).toBe('[CYCLIC REFERENCE]');
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            objectParserManager: {
                addObjectParser: (createFunction: any, ...tags: any) => {
                    expect(createFunction()).toBeInstanceOf(CsvObjectParser);
                    expect(tags).toEqual(['csv']);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
