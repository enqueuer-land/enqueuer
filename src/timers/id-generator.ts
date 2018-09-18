import {DateController} from './date-controller';
import hash from 'object-hash';

export class IdGenerator {

    private value: string;

    public constructor(value: any) {
        this.value = value as string;
    }

    public generateId(): string {
        return new DateController().getStringOnlyNumbers() +
                '_' +
                hash(this.value).substr(0, 8);
    }

}