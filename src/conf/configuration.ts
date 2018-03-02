
export class Configuration {

    private static singleton: Configuration = new Configuration();

    private fileParameters  = require('read-yaml').sync("conf/uds.yml");
    private commandLine = require('commander')
        .version('0.0.1', '-V, --version')
        .option('-f, --requisition-folder <path>', 'Specifies an input requisition folder')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .parse(process.argv);

    private constructor() {
    }

    static getRequisitionFolder(): string {
        if (Configuration.singleton.commandLine.requisitionFolder != null)
            return Configuration.singleton.commandLine.requisitionFolder;
        if (Configuration.singleton.fileParameters.inputRequisitionFile != null)
            return Configuration.singleton.fileParameters.inputRequisitionFile;
        return "./";
    }

    static isVerboseMode(): boolean {
        return (Configuration.singleton.commandLine.verbose != null) ||
            (Configuration.singleton.fileParameters.verbose != null);
    }
}
