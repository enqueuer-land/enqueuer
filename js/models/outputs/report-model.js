"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkValidation(reportModel) {
    return Object.keys(reportModel.tests).filter((key) => !reportModel.tests[key]).length == 0;
}
exports.checkValidation = checkValidation;
