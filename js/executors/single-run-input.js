"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const runnable_parser_1 = require("../runnables/runnable-parser");
const glob = __importStar(require("glob"));
const fs = __importStar(require("fs"));
const logger_1 = require("../loggers/logger");
class SingleRunInput {
    constructor(singleRunConfiguration) {
        this.filesName = [];
        singleRunConfiguration.files.forEach((file) => {
            this.filesName = this.filesName.concat(glob.sync(file));
        });
        logger_1.Logger.error(`Files list: ${this.filesName}`);
    }
    getRequisitionsRunnables() {
        const runnableParser = new runnable_parser_1.RunnableParser();
        let result = [];
        this.filesName.map(fileName => {
            try {
                result.push({ name: fileName, content: runnableParser.parse(fs.readFileSync(fileName).toString()) });
            }
            catch (err) {
                logger_1.Logger.error(`Error parsing ${fileName}: ` + err);
            }
        });
        return result;
    }
}
exports.SingleRunInput = SingleRunInput;
