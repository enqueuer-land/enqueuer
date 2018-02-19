import { IpcMqtt } from "./ipc-mqtt";
import { IpcCommunicator } from "./ipc-communicator";

export class IpcFactory {
    create(configurations: any): IpcCommunicator | null {
        if (configurations.protocol == "mqtt")
            return new IpcMqtt(configurations);
        return null;
    }
}