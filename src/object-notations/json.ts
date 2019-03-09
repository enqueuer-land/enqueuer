import {ObjectNotation} from './object-notation';
import * as fs from 'fs';
import {ObjectDecycler} from './object-decycler';

export class Json implements ObjectNotation {

    public parse(value: string): object {
        return JSON.parse(value);
    }

    public stringify(value: object, space: number = 2): string {
        return JSON.stringify(new ObjectDecycler().decycle(value || {}), null, space) as string;
    }

    public loadFromFileSync(filename: string): object {
        return this.parse(fs.readFileSync(filename).toString());
    }

}
