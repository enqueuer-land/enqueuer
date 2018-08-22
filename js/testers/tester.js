"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tester {
    constructor() {
        this.report = [];
    }
    getReport() {
        return this.report;
    }
    toBeEqualTo(label, actual, expected) {
        this.report.push({
            label: label,
            valid: actual == expected,
            errorDescription: `Expected value to be equal to '${expected}'. Received '${actual}'`
        });
    }
    toBeGreaterThan(label, actual, expected) {
        this.report.push({
            label: label,
            valid: actual > expected,
            errorDescription: `Expected value to be greater than '${expected}'. Received '${actual}'`
        });
    }
    toBeGreaterThanOrEqualTo(label, actual, expected) {
        this.report.push({
            label: label,
            valid: actual >= expected,
            errorDescription: `Expected value to be greater than or equal to '${expected}'. Received '${actual}'`
        });
    }
    toBeLessThan(label, actual, expected) {
        this.report.push({
            label: label,
            valid: actual < expected,
            errorDescription: `Expected value to be less than '${expected}'. Received '${actual}'`
        });
    }
    toBeLessThanOrEqualTo(label, actual, expected) {
        this.report.push({
            label: label,
            valid: actual <= expected,
            errorDescription: `Expected value to be less than or equal to '${expected}'. Received '${actual}'`
        });
    }
    toBeTruthy(label, expected) {
        this.report.push({
            label: label,
            valid: !!expected,
            errorDescription: `'${expected}' is not true. I swear`
        });
    }
    toBeFalsy(label, expected) {
        this.report.push({
            label: label,
            valid: !expected,
            errorDescription: `'${expected}' is not false. (Oh really?)`
        });
    }
    toContain(label, expected, toContain) {
        this.report.push({
            label: label,
            valid: expected.indexOf(toContain) != -1,
            errorDescription: `'${expected}' does not contain '${toContain}'`
        });
    }
    toBeDefined(label, defined) {
        this.report.push({
            label: label,
            valid: defined !== undefined,
            errorDescription: `'${defined}' is not defined`
        });
    }
    toBeUndefined(label, defined) {
        this.report.push({
            label: label,
            valid: defined === undefined,
            errorDescription: `'${defined}' is not undefined`
        });
    }
}
exports.Tester = Tester;
