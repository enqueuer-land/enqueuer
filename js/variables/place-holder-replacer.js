"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlaceHolderReplacer {
    constructor() {
        this.variablesMap = [];
    }
    addVariableMap(variableMap) {
        this.variablesMap.unshift(variableMap);
        return this;
    }
    replace(json) {
        var str = JSON.stringify(json);
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
