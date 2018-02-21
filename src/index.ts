import { IpcCommunicator } from "./ipc/ipc-communicator";
import { Report } from "./report/report";
import { CommandLineParser } from "./command-line/command-line-parser";
import { IpcCommunicatorFactory } from "./ipc/ipc-communicator-factory";
const fs = require("fs");

class Startup {

  public start(): void {

    const communicator: IpcCommunicator = new IpcCommunicatorFactory().create();
    if (communicator)
      communicator.start((report: Report) => this.onFinish(report));
  } 

  public onFinish(report: Report): void {
    if (!CommandLineParser.getInstance().getOptions().silentMode)
      report.print();

    if (CommandLineParser.getInstance().getOptions().outputFileResult)
      fs.writeFileSync(CommandLineParser.getInstance().getOptions().outputFileResult, report.toString());
    
    process.exit(0);
  }
  
}

new Startup().start();