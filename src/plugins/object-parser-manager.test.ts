import {ObjectParserManager} from './object-parser-manager';
import prettyjson from 'prettyjson';

jest.mock('prettyjson');

const render = jest.fn();
// @ts-ignore
prettyjson.render.mockImplementation(render);

describe('ObjectParserManager', () => {

    beforeEach(() => {
        render.mockClear();
    });

    it('should return undefined', () => {
        expect(new ObjectParserManager().createParser('undefined')).toBeUndefined();
    });

    it('should ignore case', () => {
        const myObject = 'myObject' as any;
        const tags = 'tagsLowerUpperCase';

        // @ts-ignore
        const objectParserManager = new ObjectParserManager();
        objectParserManager.addObjectParser(() => myObject, tags);

        expect(objectParserManager.createParser(tags.toUpperCase())).toBe(myObject);
    });

    it('should tryToParseWithParsers', () => {
        const parsed = 'parsed';
        const objectParserManager = new ObjectParserManager();
        // @ts-ignore
        objectParserManager.addObjectParser(() => {
            return {
                parse: () => parsed
            };
        }, 'first');

        expect(objectParserManager.tryToParseWithParsers('stuff', ['first'])).toBe(parsed);
    });

    it('should tryToParseWithEveryParser subset error', () => {
        const objectParserManager = new ObjectParserManager();
        // @ts-ignore
        objectParserManager.addObjectParser(() => {
            return {
                parse: () => {
                    throw 'error';
                }
            };
        }, 'first');

        // @ts-ignore
        objectParserManager.addObjectParser(() => {
            return {
                parse: () => {
                    throw 'other error';
                }
            };
        }, 'other');

        try {
            objectParserManager.tryToParseWithParsers('stuff', ['other']);
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err).toEqual({
                other: 'other error'
            });
        }

    });

    it('should describe every ObjectParser', () => {
        const parserList = ['ob1', 'ob2'];
        const objectParserManager = new ObjectParserManager();
        // @ts-ignore
        parserList.forEach(op => objectParserManager.addObjectParser(() => op, 'whatever'));

        const status = objectParserManager.describeMatchingObjectParsers(true);

        expect(status).toBeTruthy();
        expect(render).toHaveBeenCalledWith({'parsers': [['whatever'], ['whatever']]}, expect.anything());
    });

    it('should describe given ObjectParser', () => {
        const parserList = ['ob1', 'ob2'];
        const objectParserManager = new ObjectParserManager();
        // @ts-ignore
        parserList.forEach(op => objectParserManager.addObjectParser(() => op, op));

        const status = objectParserManager.describeMatchingObjectParsers(parserList[1]);

        expect(status).toBeTruthy();
        expect(render).toHaveBeenCalledWith({'parsers': [['ob2']]}, expect.anything());
    });

    it('should error when describing no given ObjectParser', () => {
        const parserList = ['ob1', 'ob2'];
        const objectParserManager = new ObjectParserManager();
        // @ts-ignore
        parserList.forEach(op => objectParserManager.addObjectParser(() => op, op));

        const status = objectParserManager.describeMatchingObjectParsers('unknown');

        expect(status).toBeFalsy();
        expect(render).toHaveBeenCalledWith({'parsers': []}, expect.anything());
    });

});
