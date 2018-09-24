export class ObjectDecycler {
    private cache = new Map();
    private circularReplacer?: string;

    public constructor(circularReplacer?: string) {
        this.circularReplacer = circularReplacer;
    }

    public decycle(value: object): object {
        const stringified = JSON.stringify(value, (key, value) => {
            if (typeof(value) === 'object' && value !== null) {
                if (this.cache.has(value)) {
                    // Circular reference found, discard key
                    return this.circularReplacer;
                }
                // Store value in our map
                this.cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
}