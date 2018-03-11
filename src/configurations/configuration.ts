import {StandardOutputPublisher} from "../publishers/standard-output-publisher";
import {Logger} from "../loggers/logger";
const readYml  = require('read-yaml');

const commander = require('commander')
    .version(process.env.npm_package_version, '-V, --version')
    .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
    .option('-v, --verbose', 'Activates verbose mode', false)
    .option('-l, --logLevel <level>', 'Set log level')
    .option('-c, --config-file <path>', 'Set configurationFile')
    .parse(process.argv);
const configFilename = commander.configFile || "conf/enqueuer.yml";


export class Configuration {

    protected static singleton: Configuration | undefined;

    private configurationFile: any;
    private commandLine: any;

    protected constructor(commandLine: any, configurationFile: any) {
        this.commandLine = commandLine;
        this.configurationFile = configurationFile;
        this.printConfiguration();
        if (Logger)
            Logger.setLoggerLevel(this.getLogLevel());
    }

    public static getInstance(commandLine: any = commander, configurationFile: any = readYml.sync(configFilename)): Configuration {
        if (!Configuration.singleton) {
            Configuration.singleton = new Configuration(commandLine, configurationFile);
        }
        return Configuration.singleton;
}

    public getLogLevel(): string {
        console.log("logLevel:" + JSON.stringify(this.commandLine))
        if (this.commandLine.verbose)
            return 'debug';
        return (this.commandLine.logLevel) ||
            (this.configurationFile["log-level"]);
    }

    public getInputs(): any[] {
        return this.configurationFile.requisition.inputs;
    }

    public getOutputs(): any[] {
        return this.configurationFile.requisition.outputs;
    }

    private printConfiguration(): any {
        if (this.commandLine.verbose || this.configurationFile.verbose) {
            const payload = {
                payload: JSON.stringify(this.configurationFile),
                type: "standard-output"
            };
            new StandardOutputPublisher(payload)
                .publish()
                .catch (err => {})
        }
    }
}
