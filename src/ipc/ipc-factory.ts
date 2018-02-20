import { IpcCommunicator } from "./ipc-communicator";
import { InputRequisitionFile } from "./input-requisition-file";
import { IpcUds } from "./ipc-uds";
import { IpcStandardInput } from "./ipc-standard-input";
import { ConfigurationFile } from "../conf/configuration-file";

export class IpcFactory {

    private commandLine: any;

    constructor(commandLine: any = {}) {
        this.commandLine = commandLine;
    }

    create(): IpcCommunicator {
        if (this.commandLine.standardInput)
            return new IpcStandardInput();
        if (this.commandLine.inputRequisitionFile)
            return new InputRequisitionFile(this.commandLine.inputRequisitionFile, this.commandLine.outputFileResult);
        if (ConfigurationFile.getConfigurations().protocol == "uds")
            return new IpcUds();
        throw new Error(`Undefined ipc protocol: ${ConfigurationFile.getConfigurations().protocol}`);
    }
}