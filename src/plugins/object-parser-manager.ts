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
        this.addedObjectParsers.unshift({tags: strings, createFunction});
    }

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
        Logger.warning(`No object parser was found with '${tag}'`);
    }

    public tryToParseWithParsers(fileBufferContent: string, tags: string[] = []): string | object {
        const errorResult: any = {};
        for (const tag of tags) {
            const objectParser = this.createParser(tag);
            if (objectParser) {
                try {
                    const parse = objectParser.parse(fileBufferContent);
                    Logger.debug(`Content parsed as ${tag}`);
                    return parse;
                } catch (err) {
                    errorResult[tag] = err.toString();
                }
            } else {
                errorResult[tag] = `No object parser was found with '${tag}'`;
            }
        }
        throw errorResult;
    }

}
