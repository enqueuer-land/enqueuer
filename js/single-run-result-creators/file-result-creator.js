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
const yaml = __importStar(require("yamljs"));
class FileResultCreator {
    constructor(filename) {
        this.report = {
            name: filename,
            tests: [],
            valid: true,
            requisitions: []
        };
    }
    addTestSuite(name, report) {
        report.name = name;
        this.report.requisitions.push(report);
        this.report.valid = this.report.valid && report.valid;
    }
    addError(err) {
        this.report.valid = false;
    }
    isValid() {
        return this.report.valid;
    }
    create() {
        let content = this.report;
        if (this.report.name.endsWith('yml') || this.report.name.endsWith('yaml')) {
            content = yaml.stringify(content, 10, 2);
        }
        else /*if (this.report.name.endsWith('json')) */ {
            content = JSON.stringify(content, null, 2);
        }
        fs.writeFileSync(this.report.name, content);
    }
}
exports.FileResultCreator = FileResultCreator;
