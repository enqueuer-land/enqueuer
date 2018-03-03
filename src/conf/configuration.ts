
export class Configuration {

    private static singleton: Configuration = new Configuration();

    private fileParameters  = require('read-yaml').sync("conf/enqueuer.yml");
    private commandLine = require('commander')
        .version('0.0.1', '-V, --version')
        .option('-w, --watch-folder <path>', 'Specifies a folder to watch requisition files')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .parse(process.argv);

    private constructor() {
    }

    static getWatchFolder(): string {
        if (Configuration.singleton.commandLine.watchFolder != null)
            return Configuration.singleton.commandLine.watchFolder;
        if (Configuration.singleton.fileParameters.watchFolder != null)
            return Configuration.singleton.fileParameters.watchFolder;
        return "./";
    }

    static isVerboseMode(): boolean {
        return (Configuration.singleton.commandLine.verbose != null) ||
            (Configuration.singleton.fileParameters.verbose != null);
    }
}
