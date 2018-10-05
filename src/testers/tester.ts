import {Test} from './test';

export class Tester {

    private report: Test[] = [];

    public getReport(): Test[] {
        return this.report;
    }

    public addTest(test: Test): void {
        this.report.push(test);
    }

    public toBeEqualTo(label: string, actual: number, expected: number, fieldName: string): void {
        const valid = actual == expected;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: `Expected '${fieldName}' to be equal to '${expected}'. Received '${actual}'`
        });
    }

    public toBeGreaterThan(label: string, actual: number, expected: number, fieldName: string): void {
        const valid = actual > expected;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: `Expected '${fieldName}' to be greater than '${expected}'. Received '${actual}'`
        });
    }

    public toBeGreaterThanOrEqualTo(label: string, actual: number, expected: number, fieldName: string): void {
        const valid = actual >= expected;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: `Expected '${fieldName}' to be greater than or equal to '${expected}'. Received '${actual}'`
        });
    }

    public toBeLessThan(label: string, actual: number, expected: number, fieldName: string): void {
        const valid = actual < expected;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: `Expected '${fieldName}' to be less than '${expected}'. Received '${actual}'`
        });
    }

    public toBeLessThanOrEqualTo(label: string, actual: number, expected: number, fieldName: string): void {
        const valid = actual <= expected;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: `Expected '${fieldName}' to be less than or equal to '${expected}'. Received '${actual}'`
        });
    }

    public toContain(label: string, expected: string, toContain: string, fieldName: string): void {
        const valid = expected.indexOf(toContain) != -1;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: !valid ? `'${fieldName}' (${expected}) does not contain '${toContain}'` :
                                        `'${fieldName}' (${expected}) contains '${toContain}'`
        });
    }

    public expectToBeTruthy(label: string, expected: any, fieldName: string): void {
        this.report.push({
            label: label,
            valid: !!expected,
            errorDescription: !expected ? `'${fieldName}' is not true. I swear` : `'${fieldName}' is true`
        });
    }

    public expectToBeFalsy(label: string, expected: any, fieldName: string): void {
        const valid = !expected;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: !valid ? `'${fieldName}' is not false. (Oh really?)` : `'${fieldName}' is false`
        });
    }

    public expectToBeDefined(label: string, defined: any, fieldName: string): void {
        const valid = defined !== undefined;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: !valid ? `'${fieldName}' is not defined` : `'${fieldName}' is defined`
        });
    }

    public expectToBeUndefined(label: string, defined: any, fieldName: string): void {
        const valid = defined === undefined;
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: !valid ? `'${fieldName}' is not undefined` : `'${fieldName}' is undefined`
        });
    }

}