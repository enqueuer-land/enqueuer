import {StandardOutputPublisher} from "../publishers/standard-output-publisher";
const readYml  = require('read-yaml');

export class Configuration {

    private static singleton: Configuration = new Configuration();

    private fileParameters: any;
    private commandLine = require('commander')
        .version(process.env.npm_package_version, '-V, --version')
        .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .option('-l, --logLevel <level>', 'Set log level')
        .option('-c, --config-file <path>', 'Set configurationFile')
        .parse(process.argv);

    private constructor() {
        const configFilename = (this.commandLine.configFile)?
                                                this.commandLine.configFile :
                                                "conf/enqueuer.yml";

        this.fileParameters = readYml.sync(configFilename);
        this.printConfiguration()
    }

    private printConfiguration(): any {
        if (this.commandLine.verbose || this.fileParameters.verbose) {
            const payload = {
                payload: JSON.stringify(this.fileParameters),
                type: "standard-output"
            };
            new StandardOutputPublisher(payload)
                .publish();
        }
    }


    public static getLogLevel(): string {
        if (Configuration.singleton.commandLine.verbose)
            return 'debug';
        return (Configuration.singleton.commandLine.logLevel) ||
            (Configuration.singleton.fileParameters["log-level"]);
    }

    public static getInputs(): any[] {
        return Configuration.singleton.fileParameters.requisition.inputs;
    }

    public static getOutputs(): any[] {
        return Configuration.singleton.fileParameters.requisition.outputs;
    }
}
