"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommandLineParser = /** @class */ (function () {
    function CommandLineParser() {
        this.commandLine = require('commander')
            .version('0.0.1', '-v, --version')
            .option('-i, --standard-input', 'Reads requisition from standard input')
            .option('-f, --input-requisition-file <pathToFile>', 'Specifies an input requisition file')
            .option('--silent-mode', 'Activates silent mode')
            .parse(process.argv);
    }
    ;
    CommandLineParser.getInstance = function () {
        if (!this.singleton)
            this.singleton = new CommandLineParser();
        return this.singleton;
    };
    CommandLineParser.prototype.getOptions = function () {
        return this.commandLine;
    };
    CommandLineParser.singleton = null;
    return CommandLineParser;
}());
exports.CommandLineParser = CommandLineParser;
