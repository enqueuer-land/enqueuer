import { IpcFactory } from "./ipc/ipc-factory";
import { IpcCommunicator } from "./ipc/ipc-communicator";
const commandLine = require('commander');
 
commandLine
  .version('0.1.0', '-v, --version')
  .option('-i, --standard-input', 'Reads requisition from standard input')
  .option('-f, --input-requisition-file <pathToFile>', 'Specify an input requisition file')
  .option('-o, --output-file-result <pathToFile>', 'Specify an output file')
  .parse(process.argv);

class Startup {

  public start(): void {

    const communicator: IpcCommunicator = new IpcFactory(commandLine).create();
    if (communicator)
      communicator.start((number: number) => this.onFinish(number));
  } 

  public onFinish(number: number): void {
    console.log(`Execution result: ${number}`);
    process.exit(number);
  }
  
}

new Startup().start();