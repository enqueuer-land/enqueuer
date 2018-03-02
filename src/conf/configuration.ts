
export class Configuration {

    private static singleton: Configuration = new Configuration();

    private fileParameters  = require('read-yaml').sync("conf/uds.yml");
    private commandLine = require('commander')
        .version('0.0.1', '-V, --version')
        .option('-i, --standard-input', 'Reads requisition from standard input')
        .option('-f, --input-requisition-fileParameters <pathToFile>', 'Specifies an input requisition fileParameters')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .parse(process.argv);

    private constructor() {
    }


    static getInputRequisitionFileName(): string | null {
        if (Configuration.singleton.commandLine.inputRequisitionFile != null)
            return Configuration.singleton.commandLine.inputRequisitionFile;
        if (Configuration.singleton.fileParameters.inputRequisitionFile != null)
            return Configuration.singleton.fileParameters.inputRequisitionFile;
        return null;
    }

    static isVerboseMode(): boolean {
        return (Configuration.singleton.commandLine.verbose != null) ||
            (Configuration.singleton.fileParameters.verbose);
    }
}
