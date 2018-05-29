"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkValidation(reportModel) {
    const length2 = Object.keys(reportModel.tests).filter((key) => !reportModel.tests[key]).length;
    console.log(length2);
    return length2 == 0;
}
exports.checkValidation = checkValidation;
