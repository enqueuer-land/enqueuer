"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readYaml = require('read-yaml');
var Configuration = /** @class */ (function () {
    function Configuration() {
        this.file = readYaml.sync("conf/uds.yml");
        this.commandLine = require('commander')
            .version('0.0.1', '-V, --version')
            .option('-i, --standard-input', 'Reads requisition from standard input')
            .option('-f, --input-requisition-file <pathToFile>', 'Specifies an input requisition file')
            .option('-v, --verbose', 'Activates verbose mode', false)
            .parse(process.argv);
    }
    Configuration.getInputRequisitionFileName = function () {
        if (Configuration.singleton.commandLine.inputRequisitionFile != null)
            return Configuration.singleton.commandLine.inputRequisitionFile;
        if (Configuration.singleton.file.inputRequisitionFile != null)
            return Configuration.singleton.file.inputRequisitionFile;
        return null;
    };
    Configuration.isVerboseMode = function () {
        return (Configuration.singleton.commandLine.verbose != null) ||
            (Configuration.singleton.file.verbose);
    };
    Configuration.singleton = new Configuration();
    return Configuration;
}());
exports.Configuration = Configuration;
