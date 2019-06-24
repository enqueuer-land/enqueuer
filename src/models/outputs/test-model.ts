export interface TestModel {
    ignored?: boolean;
    description: string;
    valid: boolean;
    name: string;
}

export function testModelIsPassing(test: TestModel): boolean {
    return test.ignored || test.valid;
}
