import {ObjectNotation} from './object-notation';
import * as fs from 'fs';

export class JavascriptObjectNotation extends ObjectNotation {

    public parse(value: string): object {
        return JSON.parse(value);
    }

    public stringify(value: object): string {
        return JSON.stringify(ObjectNotation.decycle(value), null, 2);
    }

    public loadFromFileSync(filename: string): object {
        return this.parse(fs.readFileSync(filename).toString())
    }

}