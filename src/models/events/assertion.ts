export interface Assertion {
    name: string;
    ignore?: boolean;
    [propName: string]: any;
}
