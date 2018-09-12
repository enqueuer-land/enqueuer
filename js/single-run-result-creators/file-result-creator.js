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
const logger_1 = require("../loggers/logger");
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
        this.report.tests.push({
            description: err,
            valid: false,
            name: 'Requisition ran'
        });
        this.report.valid = false;
    }
    isValid() {
        return this.report.valid;
    }
    create() {
        let content = this.report;
        if (this.report.name.endsWith('yml') || this.report.name.endsWith('yaml')) {
            try {
                logger_1.Logger.info(`Generating single-run yml report file: ${this.report.name}`);
                content = yaml.stringify(FileResultCreator.decycle(content), 10, 2);
            }
            catch (err) {
                logger_1.Logger.warning(`Error generating yml report: ${err}`);
                fs.writeFileSync(this.report.name, content);
                logger_1.Logger.debug(`Single-run report file created`);
                return;
            }
        }
        else /*if (this.report.name.endsWith('json')) */ {
            logger_1.Logger.info(`Generating single-run as json report file: ${this.report.name}`);
            content = JSON.stringify(content, null, 2);
        }
        fs.writeFileSync(this.report.name, content);
        logger_1.Logger.debug(`Single-run report file created`);
    }
    static decycle(decyclable) {
        const cache = new Map();
        const stringified = JSON.stringify(decyclable, (key, value) => {
            if (typeof (value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return JSON.parse(stringified);
    }
}
exports.FileResultCreator = FileResultCreator;
