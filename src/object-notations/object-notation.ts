export abstract class ObjectNotation {
    abstract parse(value: string): object;
    abstract stringify(value: object, space: number): string;
    abstract loadFromFileSync(filename: string): object;
}
