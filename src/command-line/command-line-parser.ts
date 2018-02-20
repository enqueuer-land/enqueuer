export class CommandLineParser {
    private commandLine = require('commander');
    private static singleton: CommandLineParser = new CommandLineParser();
    
    private constructor() {
        this.commandLine
          .version('0.1.0', '-v, --version')
          .option('-i, --standard-input', 'Reads requisition from standard input')
          .option('-f, --input-requisition-file <pathToFile>', 'Specifies an input requisition file')
          .option('-o, --output-file-result <pathToFile>', 'Specifies an output file')
          .option('-v, --verbose-mode', 'Activates verbose mode')
          .parse(process.argv);
    }

    public static getOptions(): any {
        return JSON.parse(JSON.stringify(
            CommandLineParser.singleton.commandLine));
    }
}
