//TODO bring CSV back
//TODO test javascript parser
export interface ObjectParser {
    //TODO throw on error
    parse(value: string, query?: any): object;

    //TODO Remove it
    stringify(value: object, query?: any): string;
}
