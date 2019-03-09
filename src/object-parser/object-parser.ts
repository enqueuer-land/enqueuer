export interface ObjectParser {
    parse(value: string, query?: any): object | string;
    stringify(value: object, params?: any): string;
}
