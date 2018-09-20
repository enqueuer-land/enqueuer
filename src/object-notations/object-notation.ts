export abstract class ObjectNotation {
    public abstract parse(value: string): object;
    public abstract stringify(value: object): string | undefined;
    public abstract loadFromFileSync(filename: string): object;

    public static decycle(value: object): object {
        const cache = new Map();
        const stringified = JSON.stringify(value, (key, value) => {
            if (typeof(value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
}