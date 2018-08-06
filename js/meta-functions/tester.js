"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tester {
    constructor() {
        this.report = [];
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
    getReport() {
        return this.report;
    }
    isEqualTo(label, actual, expected) {
        let result = {
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
}
exports.Tester = Tester;
