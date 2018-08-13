import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import * as yaml from 'yamljs';
import {Command} from 'commander';
const packageJson = require('../../package.json');
let configFileName = '';

let commandLineStore: any = {};
let commander: any = {};
if (!process.argv[1].toString().match('jest')) {
    commander = new Command()
    .version(process.env.npm_package_version || packageJson.version, '-v, --version')
    .usage('-c <confif-file-path>')
    .option('-q, --quiet', 'Disable logging', false)
    .option('-l, --log-level <level>', 'Set log level')
    .option('-c, --config-file <path>', 'Set configurationFile')
    .option('-s, --store [store]', 'Add variables values to this session',
        (val: string, memo: string[]) => {
                const split = val.split('=');
                if (split.length == 2) {
                    commandLineStore[split[0]] = split[1];
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
    ymlFile = yaml.load(configFileName);
} catch (err) {
    Logger.error(`Impossible to read configuration file: ${configFileName} -> ${err}`);
    ymlFile = {};
}

export class Configuration {

    private configurationFile: any;
    private commandLine: any;

    public constructor(commandLine: any = commander, configurationFile: any = ymlFile) {
        this.commandLine = commandLine;
        this.configurationFile = configurationFile;
        this.configurationFile.store = this.configurationFile.store || {};
    }

    public getLogLevel(): string | undefined {
        return (this.commandLine.logLevel) ||
            (this.configurationFile['log-level']);
    }

    public getRequisitionRunMode(): any {
        if (this.configurationFile) {
            return this.configurationFile['run-mode'];
        }
        return undefined;
    }

    public getOutputs(): PublisherModel[] {
        if (!this.configurationFile.outputs) {
            return [];
        }
        return this.configurationFile.outputs;
    }

    public getStore(): any {
        return this.configurationFile.store || {};
    }

    public isQuietMode(): any {
        return this.commandLine.quiet || false;
    }

    public getFile(): any {
        return this.configurationFile;
    }
}
