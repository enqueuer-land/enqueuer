import { IpcCommunicator } from "./ipc-communicator";
import { InputRequisitionFile } from "./input-requisition-file";
import { IpcUds } from "./ipc-uds";

export class IpcFactory {

    private configurations: any;
    private commandLine: any;

    constructor(configurations: any, commandLine: any = {}) {
        this.configurations = configurations;
        this.commandLine = commandLine;
    }

    create(): IpcCommunicator {
        if (this.commandLine.inputRequisitionFile)
            return new InputRequisitionFile(this.commandLine.inputRequisitionFile, this.commandLine.outputFileResult);
        if (this.configurations.protocol == "uds")
            return new IpcUds();
        throw new Error(`Undefined ipc protocol: ${this.configurations.protocol}`);
    }
}
