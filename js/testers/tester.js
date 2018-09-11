"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tester {
    constructor() {
        this.report = [];
    }
    getReport() {
        return this.report;
    }
    addTest(test) {
        this.report.push(test);
    }
    toBeEqualTo(label, actual, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: actual == expected,
            errorDescription: `Expected '${fieldName}' to be equal to '${expected}'. Received '${actual}'`
        });
    }
    toBeGreaterThan(label, actual, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: actual > expected,
            errorDescription: `Expected '${fieldName}' to be greater than '${expected}'. Received '${actual}'`
        });
    }
    toBeGreaterThanOrEqualTo(label, actual, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: actual >= expected,
            errorDescription: `Expected '${fieldName}' to be greater than or equal to '${expected}'. Received '${actual}'`
        });
    }
    toBeLessThan(label, actual, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: actual < expected,
            errorDescription: `Expected '${fieldName}' to be less than '${expected}'. Received '${actual}'`
        });
    }
    toBeLessThanOrEqualTo(label, actual, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: actual <= expected,
            errorDescription: `Expected '${fieldName}' to be less than or equal to '${expected}'. Received '${actual}'`
        });
    }
    toContain(label, expected, toContain, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: expected.indexOf(toContain) != -1,
            errorDescription: `'${fieldName}' (${expected}) does not contain '${toContain}'`
        });
    }
    expectToBeTruthy(label, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: !!expected,
            errorDescription: `'${fieldName}' is not true. I swear`
        });
    }
    expectToBeFalsy(label, expected, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: !expected,
            errorDescription: `'${fieldName}' is not false. (Oh really?)`
        });
    }
    expectToBeDefined(label, defined, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: defined !== undefined,
            errorDescription: `'${fieldName}' is not defined`
        });
    }
    expectToBeUndefined(label, defined, fieldName = 'value') {
        this.report.push({
            label: label,
            valid: defined === undefined,
            errorDescription: `'${fieldName}' is not undefined`
        });
    }
}
exports.Tester = Tester;
