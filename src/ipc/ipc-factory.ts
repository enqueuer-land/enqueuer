import { IpcCommunicator } from "./ipc-communicator";
import { IpcUds } from "./ipc-uds";

export class IpcFactory {
    create(configurations: any): IpcCommunicator {
        console.log("conf protocol: " + configurations.protocol);
        if (configurations.protocol == "uds")
            return new IpcUds();
        throw new Error(`Undefined ipc protocol: ${configurations.protocol}`);
    }
}