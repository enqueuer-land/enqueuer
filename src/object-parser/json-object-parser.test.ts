import {JsonObjectParser, entryPoint} from './json-object-parser';
import {MainInstance} from '../plugins/main-instance';

describe('JsonObjectParser', () => {

    test('should keep string numbers as string', () => {
        const value = '{\n' +
            '  "firstLevel": {\n' +
            '    "secondLevel": "123.00"\n' +
            '  }\n' +
            '}';

        const parsed: any = new JsonObjectParser().parse(value);

        expect(typeof parsed.firstLevel.secondLevel).toEqual('string');
        expect(parsed.firstLevel.secondLevel).toEqual('123.00');
    });

    test('should stringify with space', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const space = 4;

        const stringified = new JsonObjectParser().stringify(value, {space: space});

        expect(stringified).toBe(JSON.stringify(value, null, space));
    });

    test('should stringify with default space', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const defaultSpace = 2;

        const stringified = new JsonObjectParser().stringify(value);

        expect(stringified).toBe(JSON.stringify(value, null, defaultSpace));
    });

    test('should stringify undefined objects', () => {
        // @ts-ignore
        const stringified = new JsonObjectParser().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;
        const expected = '{\n' +
            '  "firstLevel": {\n' +
            '    "secondLevel": {}\n' +
            '  }\n' +
            '}';

        const stringified = new JsonObjectParser().stringify(value);

        expect(stringified).toBe(expected);
    });

    test('should parse', () => {
        const value = '{\n' +
            '  "firstLevel": {\n' +
            '    "secondLevel": "value"\n' +
            '  }\n' +
            '}';
        const expected = {firstLevel: {secondLevel: 'value'}};

        const parsed = new JsonObjectParser().parse(value);

        expect(parsed).toEqual(expected);
    });

    it('Should export an entry point', done => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            objectParserManager: {
                addObjectParser: (createFunction: any, ...tags: any) => {
                    expect(createFunction()).toBeInstanceOf(JsonObjectParser);
                    expect(tags).toEqual(['json']);
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });

});
