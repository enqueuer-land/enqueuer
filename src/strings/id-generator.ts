import { DateController } from '../timers/date-controller';
import { createHash } from 'crypto';
import { ObjectDecycler } from '../object-parser/object-decycler';

export class IdGenerator {
    private readonly value: string;

    public constructor(value: any) {
        if (value && typeof value !== 'string') {
            this.value = JSON.stringify(new ObjectDecycler().decycle(value));
        } else {
            this.value = value as string;
        }
    }

    public generateId(): string {
        const hash = createHash('sha256');
        hash.update(this.value, 'utf8');
        const coded = hash.digest('hex');
        return (
            new DateController().getStringOnlyNumbers().substr(8, 10) +
            '_' +
            coded.substr(0, 10) +
            '_' +
            Math.trunc(Math.random() * 1000000 + 0x123)
        );
    }
}
