"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkValidation(reportModel) {
    return reportModel.tests.every((test) => test.valid);
}
exports.checkValidation = checkValidation;
