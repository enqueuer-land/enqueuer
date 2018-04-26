"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class ReportValidFieldsFilter {
    filterReport(report) {
        let clone = Object.assign({}, report);
        delete clone.name;
        return this.removeNotValidableField(clone);
    }
    removeNotValidableField(value) {
        if (util_1.isNullOrUndefined(value.valid)) {
            return {};
        }
        let clone = {};
        for (const key in value) {
            if (key == 'valid') {
                clone[key] = value.valid;
            }
            else if (key == 'tests' && value.tests.length > 0) {
                clone.tests = value.tests.map((test) => {
                    let testSummary = {};
                    testSummary[test.name] = test.valid;
                    return testSummary;
                });
            }
            else if (typeof value[key] == 'object') {
                const newObject = this.removeNotValidableField(value[key]);
                if (Object.keys(newObject).length > 1)
                    clone[key] = newObject;
            }
        }
        ;
        return clone;
    }
}
exports.ReportValidFieldsFilter = ReportValidFieldsFilter;
