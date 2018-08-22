import {Test} from './test';

export class Tester {

    private report: Test[] = [];

    public getReport(): Test[] {
        return this.report;
    }

    public addTest(test: Test): void {
        this.report.push(test);
    }

    public toBeEqualTo(label: string, actual: number, expected: number): void {
        this.report.push({
            label: label,
            valid: actual == expected,
            errorDescription: `Expected value to be equal to '${expected}'. Received '${actual}'`
        });
    }

    public toBeGreaterThan(label: string, actual: number, expected: number): void {
        this.report.push({
            label: label,
            valid: actual > expected,
            errorDescription: `Expected value to be greater than '${expected}'. Received '${actual}'`
        });
    }

    public toBeGreaterThanOrEqualTo(label: string, actual: number, expected: number): void {
        this.report.push({
            label: label,
            valid: actual >= expected,
            errorDescription: `Expected value to be greater than or equal to '${expected}'. Received '${actual}'`
        });
    }

    public toBeLessThan(label: string, actual: number, expected: number): void {
        this.report.push({
            label: label,
            valid: actual < expected,
            errorDescription: `Expected value to be less than '${expected}'. Received '${actual}'`
        });
    }

    public toBeLessThanOrEqualTo(label: string, actual: number, expected: number): void {
        this.report.push({
            label: label,
            valid: actual <= expected,
            errorDescription: `Expected value to be less than or equal to '${expected}'. Received '${actual}'`
        });
    }

    public toContain(label: string, expected: string, toContain: string): void {
        this.report.push({
            label: label,
            valid: expected.indexOf(toContain) != -1,
            errorDescription: `'${expected}' does not contain '${toContain}'`
        });
    }

    public expectToBeTruthy(label: string, expected: any): void {
        this.report.push({
            label: label,
            valid: !!expected,
            errorDescription: `'${expected}' is not true. I swear`
        });
    }

    public expectToBeFalsy(label: string, expected: any): void {
        this.report.push({
            label: label,
            valid: !expected,
            errorDescription: `'${expected}' is not false. (Oh really?)`
        });
    }

    public expectToBeDefined(label: string, defined: any): void {
        this.report.push({
            label: label,
            valid: defined !== undefined,
            errorDescription: `'${defined}' is not defined`
        });
    }

    public expectToBeUndefined(label: string, defined: any): void {
        this.report.push({
            label: label,
            valid: defined === undefined,
            errorDescription: `'${defined}' is not undefined`
        });
    }

}