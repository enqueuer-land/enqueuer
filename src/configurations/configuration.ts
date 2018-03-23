import {PublisherModel} from "../requisitions/models/publisher-model";
import {SubscriptionModel} from "../requisitions/models/subscription-model";
import {Logger} from "../loggers/logger";

const readYml  = require('read-yaml');

let configFileName = "conf/enqueuer.yml";

let commander: any = {};
if (!process.argv[1].toString().match("jest")) {
    commander = require('commander')
    .version(process.env.npm_package_version, '-V, --version')
    .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
    .option('-v, --verbose', 'Activates verbose mode', false)
    .option('-l, --log-level <level>', 'Set log level')
    .option('-s, --single-run-mode <requisition>', 'Run in singleRun mode')
    .option('-c, --config-file <path>', 'Set configurationFile')
    .parse(process.argv);

    configFileName = commander.configFile || configFileName;
}


let ymlFile = {};
try {
    ymlFile = readYml.sync(configFileName);
} catch (err) {
    Logger.error(`Impossible to read ${configFileName} file: ${err}`);
    ymlFile = {};
}

export class Configuration {

    private configurationFile: any;
    private commandLine: any;

    public constructor(commandLine: any = commander, configurationFile: any = ymlFile) {
        this.commandLine = commandLine;
        this.configurationFile = configurationFile;
    }

    public getLogLevel(): string | undefined {
        if (this.commandLine.verbose)
            return 'debug';
        return (this.commandLine.logLevel) ||
            (this.configurationFile["log-level"]);
    }

    public getRequisitionRunMode(): any {
        if (this.configurationFile.requisitions)
            return this.configurationFile.requisitions["run-mode"];
        else return undefined;
    }

    public getOutputs(): PublisherModel[] {
        if (!this.configurationFile.outputs)
            return [];
        return this.configurationFile.outputs;
    }

    public getFile(): any {
        return this.configurationFile;
    }
}
