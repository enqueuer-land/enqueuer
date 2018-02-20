var readYaml = require('read-yaml');
import { IpcFactory } from "./ipc/ipc-factory";
import { IpcCommunicator } from "./ipc/ipc-communicator";

class Startup {

  public start(): void {
    var configurations = readYaml.sync("conf/uds.yml");

    const communicator: IpcCommunicator = new IpcFactory().create(configurations);
    if (communicator)
      communicator.start((number: Number) => this.onFinish(number));
  } 

  public onFinish(number: Number): void {
    console.log(`Execution result: ${number}`);
  }
  
}

new Startup().start();