import { IpcCommunicator } from "./ipc-communicator";
import { IpcStandardInput } from "./ipc-standard-input";

export class IpcCommunicatorFactory {

    create(): IpcCommunicator {
        // if (Configuration.getInputRequisitionFileName())
        //     return new InputRequisitionFile();
        // if (Configuration.get)
            return new IpcStandardInput();
        // if (ConfigurationFile.getConfigurations().protocol == "uds")
        //     return new IpcUds();
        // throw new Error(`Undefined ipc protocol: ${ConfigurationFile.getConfigurations().protocol}`);
    }
}