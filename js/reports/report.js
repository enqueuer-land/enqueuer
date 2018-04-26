"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Report {
    constructor(name) {
        this.valid = true;
        this.tests = [];
        this.name = name;
    }
    addTest(title, result) {
        if (!this.tests)
            this.tests = [];
        if (!result)
            this.valid = false;
        this.tests.push({ name: title, valid: result });
    }
    static create(name, other = {}) {
        const created = new Report(name);
        Object.keys(other).forEach(key => created[key] = other[key]);
        if (other.tests != null)
            created.tests = other.tests;
        return created;
    }
}
exports.Report = Report;
