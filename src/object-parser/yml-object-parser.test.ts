import {YmlObjectParser, entryPoint} from './yml-object-parser';
import * as yaml from 'yamljs';
import {ObjectDecycler} from './object-decycler';
import {MainInstance} from '../plugins/main-instance';

describe('YmlObjectParser', () => {
    test('should stringify with param', () => {
        const value = {firstLevel: {secondLevel: 'value'}};

        const stringified = new YmlObjectParser().stringify(value, {
            space: 4,
            inline: 1
        });

        expect(stringified).toBe(yaml.stringify(value, 1, 4));
    });

    test('should stringify default', () => {
        const value = {firstLevel: {secondLevel: 'value'}};
        const defaultInline = 100;
        const defaultSpace = 2;

        const stringified = new YmlObjectParser().stringify(value);

        expect(stringified).toBe(yaml.stringify(value, defaultInline, defaultSpace));
    });

    test('should keep string numbers as string', () => {
        const value = 'firstLevel:\n' + "  secondLevel: '123.00'\n";

        const parsed: any = new YmlObjectParser().parse(value);

        expect(typeof parsed.firstLevel.secondLevel).toEqual('string');
        expect(parsed.firstLevel.secondLevel).toEqual('123.00');
    });

    test('should stringify cycle reference', () => {
        let value: any = {firstLevel: {secondLevel: {}}};
        value.firstLevel.secondLevel.thirdLevel = value;

        const stringified = new YmlObjectParser().stringify(value);

        expect(stringified).toBe(yaml.stringify(new ObjectDecycler().decycle(value), 100, 2));
    });

    test('should stringify undefined objects', () => {
        // @ts-ignore
        const stringified = new YmlObjectParser().stringify(undefined);

        expect(stringified).toBe('{}');
    });

    test('should throw parse error', () => {
        const notYml = 'foo bar\nfoo: bar';

        expect(() => new YmlObjectParser().parse(notYml)).toThrow();
    });

    it('Should export an entry point', (done) => {
        const mainInstance: MainInstance = {
            // @ts-ignore
            objectParserManager: {
                addObjectParser: (createFunction: any, ...tags: any) => {
                    expect(createFunction()).toBeInstanceOf(YmlObjectParser);
                    expect(tags.sort()).toEqual(['yml', 'yaml'].sort());
                    done();
                }
            }
        };
        entryPoint(mainInstance);
    });
});
