"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
var hash = require('object-hash');
class IdGenerator {
    constructor(value) {
        this.value = value;
    }
    generateId() {
        return new date_controller_1.DateController().getStringOnlyNumbers() +
            "_" +
            hash(this.value).substr(0, 8);
    }
}
exports.IdGenerator = IdGenerator;
