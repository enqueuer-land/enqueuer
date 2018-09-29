import {DateController} from './date-controller';
import * as crypto from 'crypto'
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

export class IdGenerator {

    private value: string;

    public constructor(value: any) {
        if (typeof(value) !== 'string') {
            this.value = new JavascriptObjectNotation().stringify(value);
        } else {
            this.value = value as string;
        }
    }

    public generateId(): string {
        const hash = crypto.createHash('sha256');
        hash.update(this.value, 'utf8');
        const coded = hash.digest('base64');
        return new DateController().getStringOnlyNumbers() +
                '_' +
                coded.substr(0, 8);
    }

}