export interface TestModel {
    ignored?: boolean;
    description: string;
    valid: boolean;
    name: string;
}

export function testModelIsPassing(test: {ignored?: boolean, valid: boolean}): boolean {
    return test.ignored || test.valid;
}
