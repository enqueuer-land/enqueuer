
export class CommandLineParser {
    private commandLine = require('commander')
                            .version('0.0.1', '-v, --version')
                            .option('-i, --standard-input', 'Reads requisition from standard input')
                            .option('-f, --input-requisition-file <pathToFile>', 'Specifies an input requisition file')
                            .option('-o, --output-file-result <pathToFile>', 'Specifies an output file')
                            .option('-s, --silent-mode', 'Deactivates verbose mode')
                                .parse(process.argv);;
    private static singleton: CommandLineParser | null = null;
    
    public static getInstance() {
        if (!this.singleton)
            this.singleton = new CommandLineParser();
        return this.singleton;
    }

    public getOptions(): any {
        return this.commandLine;
    }
}
