const readYaml = require('read-yaml');

export class Configuration {

    private static singleton: Configuration = new Configuration();

    private file  = readYaml.sync("conf/uds.yml");

    private commandLine = require('commander')
        .version('0.0.1', '-V, --version')
        .option('-i, --standard-input', 'Reads requisition from standard input')
        .option('-f, --input-requisition-file <pathToFile>', 'Specifies an input requisition file')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .parse(process.argv);

    private constructor() {

    }


    static getInputRequisitionFileName(): string | null {
        if (Configuration.singleton.commandLine.inputRequisitionFile != null)
            return Configuration.singleton.commandLine.inputRequisitionFile;
        if (Configuration.singleton.file.inputRequisitionFile != null)
            return Configuration.singleton.file.inputRequisitionFile;
        return null;
    }

    static isVerboseMode(): boolean {
        return (Configuration.singleton.commandLine.verbose != null) ||
            (Configuration.singleton.file.verbose);
    }
}
