"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const object_decycler_1 = require("./object-decycler");
class JavascriptObjectNotation {
    parse(value) {
        return JSON.parse(value);
    }
    stringify(value, space = 2) {
        return JSON.stringify(new object_decycler_1.ObjectDecycler().decycle(value || {}), null, space);
    }
    loadFromFileSync(filename) {
        return this.parse(fs.readFileSync(filename).toString());
    }
}
exports.JavascriptObjectNotation = JavascriptObjectNotation;
