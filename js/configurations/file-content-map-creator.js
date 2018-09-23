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
const fs = __importStar(require("fs"));
class FileContentMapCreator {
    constructor() {
        this.map = {};
        this.checkChildren = (node) => {
            for (const key in node) {
                const attribute = node[key];
                if (typeof attribute == 'object') {
                    this.checkChildren(attribute);
                }
                else {
                    this.replaceValue(attribute.toString());
                }
            }
        };
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
    replaceValue(node) {
        const angleBrackets = /<<[\w\s]+:\/\/[^>>]+>>/g;
        const curlyBrackets = /{{[\w\s]+:\/\/[^}}]+}}/g;
        const match = (node.match(angleBrackets) || []).concat(node.match(curlyBrackets) || []);
        match.forEach((value) => {
            const key = value.substr(2, value.length - 4);
            this.insertIntoMap(key);
        });
    }
    insertIntoMap(tag) {
        if (!this.map[tag]) {
            const filename = tag.substring(tag.indexOf('://') + 3);
            if (tag.startsWith('json://')) {
                this.map[tag] = new javascript_object_notation_1.JavascriptObjectNotation().loadFromFileSync(filename);
            }
            else if (tag.startsWith('yaml://')) {
                this.map[tag] = new yaml_object_notation_1.YamlObjectNotation().loadFromFileSync(filename);
            }
            else {
                this.map[tag] = fs.readFileSync(filename).toString();
            }
        }
    }
}
exports.FileContentMapCreator = FileContentMapCreator;
