import { ObjectParser } from '../object-parser/object-parser';
import { Logger } from '../loggers/logger';
import { prettifyJson } from '../outputs/prettify-json';

interface AddedObjectParser {
  tags: string[];
  createFunction: () => ObjectParser;
}

export class ObjectParserManager {
  private addedObjectParsers: AddedObjectParser[] = [];

  public addObjectParser(createFunction: () => ObjectParser, firstTag: string, ...tags: string[]): void {
    const strings = [firstTag].concat(tags);
    this.addedObjectParsers.unshift({ tags: strings, createFunction });
  }

  public getMatchingObjectParsers(describeObjectParsers: string | true): any {
    return {
      parsers: this.addedObjectParsers
        .filter((objectParser: AddedObjectParser) =>
          typeof describeObjectParsers === 'string'
            ? (objectParser.tags || []).some((tag: string) => tag.toLowerCase() === describeObjectParsers.toLowerCase())
            : true
        )
        .map((objectParser: AddedObjectParser) => objectParser.tags)
    };
  }

  public describeMatchingObjectParsers(data: any): boolean {
    const matchingObjectParsers = this.getMatchingObjectParsers(data);
    console.log(`Describing object parsers matching: ${data}`);
    console.log(prettifyJson(matchingObjectParsers));
    return matchingObjectParsers.parsers.length > 0;
  }

  public createParser(tag: string): ObjectParser | undefined {
    const matchingObjectParsers = this.addedObjectParsers
      .filter((addedFormatter: AddedObjectParser) =>
        (addedFormatter.tags || []).some((parserKey: string) => parserKey.toLowerCase() === tag.toLowerCase())
      )
      .map((addedFormatter: AddedObjectParser) => addedFormatter.createFunction());
    if (matchingObjectParsers.length > 0) {
      return matchingObjectParsers[0];
    }
    Logger.warning(`No object parser was found with '${tag}'`);
  }

  public tryToParseWithParsers(fileBufferContent: string, tags: string[] = []): object {
    const errorMessages: string[] = [];
    for (const tag of tags) {
      const objectParser = this.createParser(tag);
      if (objectParser) {
        try {
          const parsed = objectParser.parse(fileBufferContent);
          Logger.debug(`Content parsed as ${tag}`);
          return parsed;
        } catch (err) {
          errorMessages.push(`${tag.toLocaleUpperCase()} error: ${err}`);
        }
      } else {
        errorMessages.push(`No parser was found with: ${tag}`);
      }
    }
    throw errorMessages.join(';\n');
  }
}
