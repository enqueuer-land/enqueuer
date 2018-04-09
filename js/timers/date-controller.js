"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateController {
    constructor(date = new Date()) {
        this.date = date || new Date();
    }
    toString() {
        return this.date.toISOString();
    }
    leftPad(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }
    getStringOnlyNumbers() {
        return this.leftPad(this.date.getFullYear(), 4) +
            this.leftPad(this.date.getMonth() + 1, 4) +
            this.leftPad(this.date.getDate(), 2) +
            this.leftPad(this.date.getHours(), 2) +
            this.leftPad(this.date.getMinutes(), 2) +
            this.leftPad(this.date.getSeconds(), 2) +
            this.leftPad(this.date.getMilliseconds(), 6);
    }
    getTime() {
        return this.date.getTime();
    }
}
exports.DateController = DateController;
