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
class DelimiterSeparatedValueObjectNotation {
    constructor(delimiter = ';', header = true) {
        this.delimiter = delimiter;
        this.header = header;
    }
    parse(csvText) {
        const lineSeparator = /\r?\n/;
        if (csvText.split) {
            const lines = csvText.split(lineSeparator);
            if (!this.header) {
                return lines
                    .filter(line => line.length > 0)
                    .map((line) => line.split(this.delimiter));
            }
            else if (lines[0]) {
                return this.parseWithHeader(lines);
            }
        }
        return [];
    }
    stringify(value) {
        if (!value) {
            return '{}';
        }
        const decycler = new object_decycler_1.ObjectDecycler('[CYCLIC REFERENCE]');
        if (this.header) {
            return this.stringifyWithHeader(value, decycler);
        }
        else {
            return value
                .map((row) => row
                .map((value) => decycler.decycle(value))
                .join(this.delimiter))
                .join('\r\n');
        }
    }
    stringifyWithHeader(value, decycle) {
        const title = Object.keys(value[0]);
        const csv = value
            .map((row) => title
            .map(fieldName => decycle.decycle(row[fieldName]))
            .join(this.delimiter));
        csv.unshift(title.join(this.delimiter));
        return csv.join('\r\n');
    }
    loadFromFileSync(filename) {
        return this.parse(fs.readFileSync(filename).toString());
    }
    parseWithHeader(lines) {
        let result = [];
        const headers = lines[0].split(this.delimiter);
        lines
            .filter((line, index) => line.length > 0 && index > 0)
            .forEach((currentLine) => {
            let parsedLine = {};
            currentLine.split(this.delimiter)
                .forEach((value, valuesIndex) => {
                parsedLine[headers[valuesIndex]] = value;
            });
            result.push(parsedLine);
        });
        return result;
    }
}
exports.DelimiterSeparatedValueObjectNotation = DelimiterSeparatedValueObjectNotation;
