"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Tester {
    constructor() {
        this.report = [];
    }
    getReport() {
        return this.report;
    }
    isEqualTo(label, actual, expected) {
        let result = {
            label: label,
            valid: false,
            description: `Expected value to equal '${expected}'. Received '${actual}'`
        };
        if (actual == expected) {
            result.valid = true;
            result.description = `'${actual}' is equal to '${expected}'`;
        }
        this.report.push(result);
    }
    isGreaterThan(label, actual, expected) {
        let result = {
            label: label,
            valid: false,
            description: `Expected value to be greater than '${expected}'. Received '${actual}'`
        };
        if (actual > expected) {
            result.valid = true;
            result.description = `'${actual}' is greater than '${expected}'`;
        }
        this.report.push(result);
    }
    toBeGreaterThan(label, actual, expected) {
        return this.isGreaterThan(label, actual, expected);
    }
    isGreaterThanOrEqualTo(label, actual, expected) {
        let result = {
            label: label,
            valid: false,
            description: `Expected value to be greater than or equal to '${expected}'. Received '${actual}'`
        };
        if (actual >= expected) {
            result.valid = true;
            result.description = `'${actual}' is greater than or equal to '${expected}'`;
        }
        this.report.push(result);
    }
    isLessThan(label, actual, expected) {
        let result = {
            label: label,
            valid: false,
            description: `Expected value to be less than '${expected}'. Received '${actual}'`
        };
        if (actual < expected) {
            result.valid = true;
            result.description = `'${actual}' is less than '${expected}'`;
        }
        this.report.push(result);
    }
    isLessThanOrEqualTo(label, actual, expected) {
        let result = {
            label: label,
            valid: false,
            description: `Expected value to be less than or equal to '${expected}'. Received '${actual}'`
        };
        if (actual <= expected) {
            result.valid = true;
            result.description = `'${actual}' is less than or equal to '${expected}'`;
        }
        this.report.push(result);
    }
    isTruthy(label, expected) {
        let result = {
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
    isFalsy(label, expected) {
        let result = {
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
    contains(label, expected, toContain) {
        let result = {
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
    isDefined(label, defined) {
        let result = {
            label: label,
            valid: false,
            description: `'${defined}' is not defined`
        };
        if (!util_1.isUndefined(defined)) {
            result.valid = true;
            result.description = `'${defined}' is defined`;
        }
        this.report.push(result);
    }
    isUndefined(label, defined) {
        let result = {
            label: label,
            valid: false,
            description: `'${defined}' is not undefined`
        };
        if (util_1.isUndefined(defined)) {
            result.valid = true;
            result.description = `'${defined}' is undefined`;
        }
        this.report.push(result);
    }
}
exports.Tester = Tester;
