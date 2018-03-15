import {StandardOutputPublisher} from "../publishers/standard-output-publisher";
import {Logger} from "../loggers/logger";
const readYml  = require('read-yaml');

//TODO: Why does't it work in tests?
// const commander = require('commander')
//     .version(process.env.npm_package_version, '-V, --version')
//     .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
//     .option('-v, --verbose', 'Activates verbose mode', false)
//     .option('-l, --logLevel <level>', 'Set log level')
//     .option('-c, --config-file <path>', 'Set configurationFile')
//     .parse(process.argv);
// const configFilename = commander.configFile || "conf/enqueuer.yml";
const ymlFile = readYml.sync("conf/enqueuer.yml");

export class Configuration {

    private configurationFile: any;
    private commandLine: any;

    public constructor(configurationFile: any = ymlFile) {
        // this.commandLine = commandLine;
        this.commandLine = {};
        this.configurationFile = configurationFile;

        const logLevel = this.getLogLevel();
        if (logLevel) {
            this.printConfiguration();
            if (Logger)
                Logger.setLoggerLevel(logLevel);
        }
    }

    public getLogLevel(): string | undefined {
        if (this.commandLine.verbose)
            return 'debug';
        return (this.commandLine.logLevel) ||
            (this.configurationFile["log-level"]);
    }

    public getInputs(): any[] {
        console.log("Calling the right one")
        return this.configurationFile.requisition.inputs;
    }

    public getOutputs(): any[] {
        return this.configurationFile.requisition.outputs;
    }

    private printConfiguration(): any {
        const payload = {
            payload: JSON.stringify(this.configurationFile),
            type: "standard-output"
        };
        new StandardOutputPublisher(payload)
            .publish()
            .catch (err => {})
    }
}
