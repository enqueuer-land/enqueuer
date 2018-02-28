var log = require('why-is-node-running') // should be your first require
import { IpcCommunicator } from "./ipc/ipc-communicator";
import { Report } from "./report/report";
import { CommandLineParser } from "./command-line/command-line-parser";
import { IpcCommunicatorFactory } from "./ipc/ipc-communicator-factory";

class Startup {

  public start(): void {

    const communicator: IpcCommunicator = new IpcCommunicatorFactory().create();
    if (communicator)
      communicator.start((report: Report) => this.onFinish(report));
  } 

  public onFinish(report: Report): void {
    // log();
  }
  
}

new Startup().start();