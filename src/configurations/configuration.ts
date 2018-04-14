import {PublisherModel} from "../requisitions/models/publisher-model";
import {Logger} from "../loggers/logger";
const version = require('../../package.json').version;

const readYml  = require('read-yaml');

let configFileName = "conf/enqueuer.yml";

let commandLineVariables: any = {};
let commander: any = {};
if (!process.argv[1].toString().match("jest")) {
    commander = require('commander')
    .version(process.env.npm_package_version || version, '-V, --version')
    .option('-v, --verbose', 'Activates verbose mode', false)
    .option('-l, --log-level <level>', 'Set log level')
    .option('-c, --config-file <path>', 'Set configurationFile. Defaults to conf/enqueuer.yml')
    .option('-s, --session-variables [sessionVariable]', 'Add variables values to this session',
        (val: string, memo: string[]) =>{
                const split = val.split("=");
                if (split.length == 2) {
                    commandLineVariables[split[0]] = split[1];
                }

                memo.push(val);
                return memo;
            },
            [])
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

    public getFileVariables(): any {
        return this.configurationFile.variables || {};
    }

    public getSessionVariables(): any {
        return commandLineVariables;
    }

    public getFile(): any {
        return this.configurationFile;
    }
}
