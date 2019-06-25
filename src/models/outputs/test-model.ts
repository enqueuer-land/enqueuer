export interface TestModel {
    ignored?: boolean;
    description: string;
    valid: boolean;
    name: string;
}

export function testModelIsPassing(test: { valid: boolean, ignored?: boolean }): boolean {
    return test.ignored || test.valid;
}
