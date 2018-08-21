export interface Event {
    script?: string;
    assertions?: Assertion[];
}

export interface Assertion {
    label: string,
    expected: string,
    [propName: string]: any;
}

