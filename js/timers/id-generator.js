"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("./date-controller");
const object_hash_1 = __importDefault(require("object-hash"));
class IdGenerator {
    constructor(value) {
        this.value = value;
    }
    generateId() {
        return new date_controller_1.DateController().getStringOnlyNumbers() +
            '_' +
            object_hash_1.default(this.value).substr(0, 8);
    }
}
exports.IdGenerator = IdGenerator;
