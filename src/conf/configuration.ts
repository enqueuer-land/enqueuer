import {StandardOutputPublisher} from "../publish/standard-output-publisher";
const readYml  = require('read-yaml');

export class Configuration {

    private static singleton: Configuration = new Configuration();

    private fileParameters: any;
    private commandLine = require('commander')
        .version('0.0.1', '-V, --version')
        .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .option('-c, --config-file <path>', 'Set configurationFile')
        .parse(process.argv);

    private constructor() {
        const configFilename = (this.commandLine.configFile)?
                                                this.commandLine.configFile :
                                                "conf/enqueuer.yml";

        this.fileParameters = readYml.sync(configFilename);
        new StandardOutputPublisher({payload: JSON.stringify(this.fileParameters)}).publish();
    }

    static isVerboseMode(): boolean {
        return (Configuration.singleton.commandLine.verbose != null) ||
            (Configuration.singleton.fileParameters.verbose != null);
    }

    static getReaders(): any[] {
        return Configuration.singleton.fileParameters.readers;
    }
}
