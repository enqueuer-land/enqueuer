"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkValidation(reportModel) {
    return reportModel.tests.filter((test) => !test.valid).length == 0;
}
exports.checkValidation = checkValidation;
