import {DateController} from "../timers/date-controller";
var hash = require('object-hash');

export class IdGenerator {

    private value: string;

    public constructor(value: any) {
        this.value = value as string;
    }

    public generateId(): string {
        return new DateController().getStringOnlyNumbers() +
                "_" +
                hash(this.value).substr(0, 8);
    }

}