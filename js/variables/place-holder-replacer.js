"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlaceHolderReplacer {
    constructor() {
        this.variablesMap = [];
        this.replaceInSubChildren = (node) => {
            for (const key in node) {
                const attribute = node[key];
                if (typeof attribute == 'object') {
                    node[key] = this.replaceInSubChildren(attribute);
                }
                else {
                    node[key] = this.replaceValue(attribute);
                }
            }
            return node;
        };
    }
    addVariableMap(variableMap) {
        this.variablesMap.unshift(variableMap);
        return this;
    }
    replace(json) {
        return this.replaceInSubChildren(json);
    }
    replaceValue(node) {
        var str = JSON.stringify(node);
        var output = str.replace(/{{\w+}}/g, (placeHolder) => {
            const key = placeHolder.substr(2, placeHolder.length - 4);
            return this.checkInEveryMap(key) || placeHolder;
        });
        // Array must have the first and last " stripped
        // otherwise the JSON object won't be valid on parse
        output = output.replace(/"\[(.*)\]"/, '[$1]');
        return JSON.parse(output);
    }
    checkInEveryMap(key) {
        let map = {};
        for (map of this.variablesMap) {
            const variableValue = map[key];
            if (variableValue) {
                if (typeof variableValue == 'object') {
                    // Stringify if not string yet
                    return JSON.stringify(variableValue);
                }
                return variableValue;
            }
        }
        return null;
    }
}
exports.PlaceHolderReplacer = PlaceHolderReplacer;
