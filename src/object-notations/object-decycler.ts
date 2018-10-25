export class ObjectDecycler {
    private readonly circularReplacer?: string;
    private cache = new Map();

    public constructor(circularReplacer?: string) {
        this.circularReplacer = circularReplacer;
    }

    public decycle(value: object): object {
        const stringified = JSON.stringify(value, (key, value) => this.jsonStringifyReplacer(key, value));
        return JSON.parse(stringified);
    }

    private isObject(value: any) {
        return typeof(value) === 'object';
    }

    private isNotNull(value: any) {
        return value !== null;
    }

    private register(value: any) {
        this.cache.set(value, true);
    }

    private isRegistered(value: any) {
        return this.cache.has(value);
    }

    private jsonStringifyReplacer(key: string, value: any) {
        if (this.isObject(value) && this.isNotNull(value)) {
            if (this.isRegistered(value)) {
                return this.circularReplacer;
            }
            this.register(value);
        }
        return value;
    }
}
