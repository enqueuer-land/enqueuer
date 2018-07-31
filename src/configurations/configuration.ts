import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import * as yaml from 'yamljs';
import * as fs from 'fs';
import {Command} from 'commander';

const packageJson: any = '../../package.json';
let configFileName = '';

let commandLineVariables: any = {};
let commander: any = {};
if (!process.argv[1].toString().match('jest')) {
    commander = new Command()
    .version(process.env.npm_package_version || packageJson.version, '-V, --version')
    .usage('-c <confif-file-path>')
    .option('-v, --verbose', 'Activates verbose mode', false)
    .option('-l, --log-level <level>', 'Set log level')
    .option('-c, --config-file <path>', 'Set configurationFile')
    .option('-s, --session-variables [sessionVariable]', 'Add variables values to this session',
        (val: string, memo: string[]) => {
                const split = val.split('=');
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
        this.configurationFile.variables = this.configurationFile.variables || {};
    }

    public getLogLevel(): string | undefined {
        if (this.commandLine.verbose) {
            return 'trace';
        }
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

    public getFileVariables(): any {
        return this.configurationFile.variables || {};
    }

    public setFileVariable(name: string, value: any) {
        this.configurationFile.variables[name] = value;
        fs.writeFileSync(configFileName, yaml.stringify(this.configurationFile, 10, 2));
    }

    public deleteFileVariable(name: string) {
        delete this.configurationFile.variables[name];
        fs.writeFileSync(configFileName, yaml.stringify(this.configurationFile, 10, 2));
    }

    public getSessionVariables(): any {
        return commandLineVariables || {};
    }

    public getFile(): any {
        return this.configurationFile;
    }
}
