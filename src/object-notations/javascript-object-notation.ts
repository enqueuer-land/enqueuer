import {ObjectNotation} from './object-notation';
import * as fs from 'fs';

export class JavascriptObjectNotation extends ObjectNotation {

    public parse(value: string): object {
        return JSON.parse(value);
    }

    public stringify(value: object, space: number = 2): string | undefined {
        try {
            return JSON.stringify(ObjectNotation.decycle(value), null, space);
        } catch (err) {
            /*nothing*/
        }
    }

    public loadFromFileSync(filename: string): object {
        return this.parse(fs.readFileSync(filename).toString());
    }

}