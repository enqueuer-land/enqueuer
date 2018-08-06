import {Test} from './test';

export class Tester {

    private report: Test[] = [];

    public getReport(): Test[] {
        return this.report;
    }

    public isEqualTo(label: string, actual: any, expected: any): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `${actual} is different of ${expected}`
        };
        if (actual == expected) {
            result.valid = true;
            result.description = `Expected ${actual} to be equal to ${expected}`;
        }
        this.report.push(result);
    }
    //isGreaterThan
    //isGreaterThanOrEqual
    //isLessThan
    //isLessThanOrEqual
    //toBeTruthy
    //toBeFalsy
    //toContain
    //toBeDefined
    //toBeUndefined

}