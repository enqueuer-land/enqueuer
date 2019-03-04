import {Test} from './test';

export class Tester {

    private report: Test[] = [];

    public getReport(): Test[] {
        return this.report;
    }

    public addTest(test: Test): void {
        this.report.push(test);
    }

    private addTestModel(label: string, valid: boolean, errorDescription: string): void {
        this.report.push({
            label: label,
            valid: valid,
            errorDescription: errorDescription
        });
    }

    public toBeEqualTo(label: string, actual: object, expected: object, fieldName: string): void {
        if (typeof (actual)  === 'object' && typeof (expected) === 'object') {
            this.addTestModel(label,
                JSON.stringify(actual) == JSON.stringify(expected),
                `Expected '${fieldName}' to be equal to '${expected}'. Received '${actual}'`);
        } else {
            this.addTestModel(label,
                actual == expected,
                `Expected '${fieldName}' to be equal to '${expected}'. Received '${actual}'`);
        }
    }

    public toBeGreaterThan(label: string, actual: number, expected: number, fieldName: string): void {
        this.addTestModel(label,
            actual > expected,
            `Expected '${fieldName}' to be greater than '${expected}'. Received '${actual}'`);
    }

    public toBeGreaterThanOrEqualTo(label: string, actual: number, expected: number, fieldName: string): void {
        this.addTestModel(label,
            actual >= expected,
            `Expected '${fieldName}' to be greater than or equal to '${expected}'. Received '${actual}'`);
    }

    public toBeLessThan(label: string, actual: number, expected: number, fieldName: string): void {
        this.addTestModel(label,
            actual < expected,
            `Expected '${fieldName}' to be less than '${expected}'. Received '${actual}'`);
    }

    public toBeLessThanOrEqualTo(label: string, actual: number, expected: number, fieldName: string): void {
        this.addTestModel(label,
            actual <= expected,
            `Expected '${fieldName}' to be less than or equal to '${expected}'. Received '${actual}'`);
    }

    public toContain(label: string, expected: string | object[], toContain: string | object, fieldName: string): void {
        if (typeof (expected) === 'string') {
            if (typeof (toContain) === 'string') {
                this.addTestModel(label,
                    expected.indexOf(toContain) != -1,
                    `Expecting '${fieldName}' (${expected}) to contain '${toContain}'`);
            } else {
                this.addTestModel(label,
                    false,
                    `Expecting 'toContain' to be a 'string'. Received a '${typeof (toContain)}' instead`);
            }
        } else if (Array.isArray((expected))) {
            this.addTestModel(label,
                expected.some((expectedElements: any) => expectedElements === expectedElements),
                `Expecting '${fieldName}' (${expected}) to contain '${toContain}'`);
        } else {
            this.addTestModel(label,
                false,
                `Expecting '${fieldName}' to be a string or an array. Received a '${typeof (toContain)}'`);
        }
    }

    public expectToBeTruthy(label: string, expected: any, fieldName: string): void {
        this.addTestModel(label,
            !!expected,
            `Expect '${fieldName}' to be true`);
    }

    public expectToBeFalsy(label: string, expected: any, fieldName: string): void {
        this.addTestModel(label,
            !expected,
            `Expect '${fieldName}' to be false`);
    }

    public expectToBeDefined(label: string, defined: any, fieldName: string): void {
        this.addTestModel(label,
            defined !== undefined,
            `Expect '${fieldName}' to be defined and it is: '${defined}'`);
    }

    public expectToBeUndefined(label: string, defined: any, fieldName: string): void {
        this.addTestModel(label,
            defined === undefined,
            `Expect '${fieldName}' to be undefined and it is: '${defined}'`);
    }

}
