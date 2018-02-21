import { IpcCommunicator } from "./ipc-communicator";
import { InputRequisitionFile } from "./input-requisition-file";
import { IpcUds } from "./ipc-uds";
import { IpcStandardInput } from "./ipc-standard-input";
import { ConfigurationFile } from "../conf/configuration-file";
import { CommandLineParser } from "../command-line/command-line-parser";

export class IpcCommunicatorFactory {

    create(): IpcCommunicator {
        if (CommandLineParser.getInstance().getOptions().inputRequisitionFile)
            return new InputRequisitionFile();
        if (CommandLineParser.getInstance().getOptions().standardInput)
            return new IpcStandardInput();
        if (ConfigurationFile.getConfigurations().protocol == "uds")
            return new IpcUds();
        throw new Error(`Undefined ipc protocol: ${ConfigurationFile.getConfigurations().protocol}`);
    }
}