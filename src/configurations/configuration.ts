const readYml  = require('read-yaml');

let configFileName = "conf/enqueuer.yml";

let commander: any = {};
if (!process.argv[1].toString().match("jest")) {
    commander = require('commander')
    .version(process.env.npm_package_version, '-V, --version')
    .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
    .option('-v, --verbose', 'Activates verbose mode', false)
    .option('-l, --logLevel <level>', 'Set log level')
    .option('-c, --config-file <path>', 'Set configurationFile')
    .parse(process.argv);

    configFileName = commander.configFile || configFileName;
}


const ymlFile = readYml.sync(configFileName);

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

    public getInputs(): any[] {
        return this.configurationFile.requisition.inputs;
    }

    public getOutputs(): any[] {
        return this.configurationFile.requisition.outputs;
    }

    public getFile(): any {
        return this.configurationFile;
    }
}
