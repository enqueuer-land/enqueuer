"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateController {
    constructor(date = new Date()) {
        this.date = date || new Date();
    }
    toString() {
        return this.date.toISOString();
    }
    getStringOnlyNumbers() {
        return this.date.getFullYear() +
            ("0" + (this.date.getMonth() + 1)).slice(-2) +
            ("0" + this.date.getDate()).slice(-2) +
            ("0" + this.date.getHours()).slice(-2) +
            ("0" + this.date.getMinutes()).slice(-2) +
            ("0" + this.date.getSeconds()).slice(-2) +
            ("0" + this.date.getMilliseconds()).slice(-6);
    }
    getTime() {
        return this.date.getTime();
    }
}
exports.DateController = DateController;
