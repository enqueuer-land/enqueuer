import { IpcFactory } from "./ipc/ipc-factory";
import { IpcCommunicator } from "./ipc/ipc-communicator";

class Startup {

  public start(): void {

    const communicator: IpcCommunicator = new IpcFactory().create();
    if (communicator)
      communicator.start((number: number) => this.onFinish(number));
  } 

  public onFinish(number: number): void {
    console.log(`Execution result: ${number}`);
    process.exit(number);
  }
  
}

new Startup().start();