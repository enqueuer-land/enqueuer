import {ObjectParser} from '../object-parser/object-parser';
import prettyjson from 'prettyjson';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';
import {Logger} from '../loggers/logger';

interface AddedObjectParser {
    tags: string[];
    createFunction: () => ObjectParser;
}

export class ObjectParserManager {
    private addedObjectParsers: AddedObjectParser[] = [];

    public addObjectParser(createFunction: () => ObjectParser, firstTag: string, ...tags: string[]): void {
        const strings = [firstTag].concat(tags);
        this.addedObjectParsers.push({tags: strings, createFunction});
    }

    //TODO CLI to call it
    public describeObjectParsers(describeObjectParsers: string | true): boolean {
        const data = {
            parsers: this.addedObjectParsers
                .filter((objectParser: AddedObjectParser) => typeof (describeObjectParsers) === 'string' ? (objectParser.tags || [])
                    .some((tag: string) => tag.toLowerCase() === describeObjectParsers.toLowerCase()) : true)
                .map((objectParser: AddedObjectParser) => objectParser.tags)
        };
        console.log(prettyjson.render(data, getPrettyJsonConfig()));
        return data.parsers.length > 0;
    }

    public createParser(tag: string): ObjectParser | undefined {
        const matchingObjectParsers = this.addedObjectParsers
            .filter((addedFormatter: AddedObjectParser) => (addedFormatter.tags || [])
                .some((parserKey: string) => parserKey.toLowerCase() === tag.toLowerCase()))
            .map((addedFormatter: AddedObjectParser) => addedFormatter.createFunction());
        if (matchingObjectParsers.length > 0) {
            return matchingObjectParsers[0];
        }
        Logger.trace(`No object parser was found with '${tag}'`);
    }

    public tryToParseWithEveryParser(fileBufferContent: string): string | object {
        const errorResult: any = {};
        for (const addedObject of this.addedObjectParsers) {
            const objectParser = addedObject.createFunction();
            try {
                const parse = objectParser.parse(fileBufferContent);
                Logger.debug(`Content parsed as ${addedObject.tags[0]}`);
                return parse;
            } catch (err) {
                errorResult[addedObject.tags[0]] = err;
            }
        }
        console.log(JSON.stringify(errorResult));
        throw errorResult;
    }
}
