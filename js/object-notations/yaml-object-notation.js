"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = __importStar(require("yamljs"));
const object_decycler_1 = require("./object-decycler");
class YamlObjectNotation {
    parse(value) {
        return yaml.parse(value);
    }
    stringify(value, space = 2) {
        return yaml.stringify(new object_decycler_1.ObjectDecycler().decycle(value || {}), 10, space);
    }
    loadFromFileSync(filename) {
        return yaml.load(filename);
    }
}
exports.YamlObjectNotation = YamlObjectNotation;
