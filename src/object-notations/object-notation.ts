export interface ObjectNotation {
    parse(value: string): object;
    stringify(value: object, space: number): string;
    loadFromFileSync(filename: string): object;
}
