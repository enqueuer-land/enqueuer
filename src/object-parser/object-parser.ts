//TODO test javascript parser
export interface ObjectParser {
    //TODO throw on error
    parse(value: string, query?: any): object;
}
