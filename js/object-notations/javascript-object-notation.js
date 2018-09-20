"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const object_notation_1 = require("./object-notation");
const fs = __importStar(require("fs"));
class JavascriptObjectNotation extends object_notation_1.ObjectNotation {
    parse(value) {
        return JSON.parse(value);
    }
    stringify(value, space = 2) {
        try {
            return JSON.stringify(object_notation_1.ObjectNotation.decycle(value), null, space);
        }
        catch (err) {
            /*nothing*/
        }
    }
    loadFromFileSync(filename) {
        return this.parse(fs.readFileSync(filename).toString());
    }
}
exports.JavascriptObjectNotation = JavascriptObjectNotation;
