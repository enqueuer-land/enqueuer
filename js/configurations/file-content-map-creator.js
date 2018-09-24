"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
const yaml_object_notation_1 = require("../object-notations/yaml-object-notation");
const delimiter_separated_value_object_notation_1 = require("../object-notations/delimiter-separated-value-object-notation");
const fs = __importStar(require("fs"));
class FileContentMapCreator {
    constructor() {
        this.map = {};
    }
    createMap(value) {
        if (typeof value == 'string') {
            this.checkChildren(new javascript_object_notation_1.JavascriptObjectNotation().parse(value));
        }
        else {
            this.checkChildren(value);
        }
    }
    getMap() {
        return this.map;
    }
    checkChildren(node) {
        for (const key in node) {
            const attribute = node[key];
            if (typeof attribute == 'object') {
                this.checkChildren(attribute);
            }
            else {
                this.replaceValue(attribute.toString());
            }
        }
    }
    replaceValue(node) {
        const angleBrackets = /<<[\w\s]+:\/\/[^>>]+>>/g;
        const curlyBrackets = /{{[\w\s]+:\/\/[^}}]+}}/g;
        const match = (node.match(angleBrackets) || []).concat(node.match(curlyBrackets) || []);
        match.forEach((value) => {
            const key = value.substr(2, value.length - 4);
            this.insertIntoMap(key);
        });
    }
    insertIntoMap(key) {
        if (!this.map[key]) {
            const separator = key.indexOf('://');
            const tag = key.substring(0, separator);
            const filename = key.substring(separator + 3);
            switch (tag) {
                case 'json':
                    this.map[key] = new javascript_object_notation_1.JavascriptObjectNotation().loadFromFileSync(filename);
                    break;
                case 'yml':
                    this.map[key] = new yaml_object_notation_1.YamlObjectNotation().loadFromFileSync(filename);
                    break;
                case 'yaml':
                    this.map[key] = new yaml_object_notation_1.YamlObjectNotation().loadFromFileSync(filename);
                    break;
                case 'csv':
                    this.map[key] = new delimiter_separated_value_object_notation_1.DelimiterSeparatedValueObjectNotation().loadFromFileSync(filename);
                    break;
                case 'tsv':
                    this.map[key] = new delimiter_separated_value_object_notation_1.DelimiterSeparatedValueObjectNotation('\t').loadFromFileSync(filename);
                    break;
                default: this.map[key] = fs.readFileSync(filename).toString();
            }
        }
    }
}
exports.FileContentMapCreator = FileContentMapCreator;
