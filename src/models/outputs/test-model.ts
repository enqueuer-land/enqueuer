export interface TestModel {
    ignored?: boolean;
    description: string;
    valid: boolean;
    name: string;
}

export function testModelIsPassing(test: { valid: boolean, ignored?: boolean }): boolean {
    if (test.ignored === true) {
        return false;
    }
    return test.valid === true;
}

export function testModelIsFailing(test: { valid: boolean, ignored?: boolean }): boolean {
    if (test.ignored === true) {
        return false;
    }
    return test.valid === false;
}

export function testModelIsNotFailing(test: { valid: boolean, ignored?: boolean }): boolean {
    if (test.ignored === true) {
        return true;
    }
    return test.valid !== false;
}
