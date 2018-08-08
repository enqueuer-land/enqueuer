import {Test} from './test';
import {isUndefined} from 'util';

export class Tester {

    private report: Test[] = [];

    public getReport(): Test[] {
        return this.report;
    }

    public isEqualTo(label: string, actual: number, expected: number): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${actual}' is not equal to '${expected}'`
        };
        if (actual == expected) {
            result.valid = true;
            result.description = `'${actual}' is equal to '${expected}'`;
        }
        this.report.push(result);
    }

    public isGreaterThan(label: string, actual: number, expected: number): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${actual}' is not greater than '${expected}'`
        };
        if (actual > expected) {
            result.valid = true;
            result.description = `'${actual}' is greater than '${expected}'`;
        }
        this.report.push(result);
    }

    public isGreaterThanOrEqualTo(label: string, actual: number, expected: number): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${actual}' is not greater than or equal to '${expected}'`
        };
        if (actual >= expected) {
            result.valid = true;
            result.description = `'${actual}' is greater than or equal to '${expected}'`;
        }
        this.report.push(result);
    }

    public isLessThan(label: string, actual: number, expected: number): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${actual}' is not less than '${expected}'`
        };
        if (actual < expected) {
            result.valid = true;
            result.description = `'${actual}' is less than '${expected}'`;
        }
        this.report.push(result);
    }

    public isLessThanOrEqualTo(label: string, actual: number, expected: number): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${actual}' is not less than or equal to '${expected}'`
        };
        if (actual <= expected) {
            result.valid = true;
            result.description = `'${actual}' is less than or equal to '${expected}'`;
        }
        this.report.push(result);
    }

    public isTruthy(label: string, expected: any): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${expected}' is not true. I swear`
        };
        if (!!expected) {
            result.valid = true;
            result.description = 'Definitely true';
        }
        this.report.push(result);
    }

    public isFalsy(label: string, expected: any): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${expected}' is not false. (Oh really?)`
        };
        if (!!!expected) {
            result.valid = true;
            result.description = 'Definitely false';
        }
        this.report.push(result);
    }

    public contains(label: string, expected: string, toContain: string): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${expected}' does not contain '${toContain}'`
        };
        if (expected.indexOf(toContain) != -1) {
            result.valid = true;
            result.description = `'${expected}' contains '${toContain}'`;
        }
        this.report.push(result);
    }

    public isDefined(label: string, defined: any): void {
        let result: Test = {
            label: label,
            valid: false,
            description: `'${defined}' is not defined`
        };
        if (!isUndefined(defined)) {
            result.valid = true;
            result.description = `'${defined}' is defined`;
        }
        this.report.push(result);
    }

}