const fs = require('fs');
import { IpcFactory } from "./ipc/ipc-factory";
import { IpcCommunicator } from "./ipc/ipc-communicator";

class Startup {

  public start(): void {
    const configurations = JSON.parse(fs.readFileSync("conf/enqueuer.json"));

    const communicator: IpcCommunicator | null = new IpcFactory().create(configurations);
    if (communicator)
      communicator.start();
  } 

  
}

new Startup().start();