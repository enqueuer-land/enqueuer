import { IpcMqtt } from "./ipc-mqtt";
import { IpcCommunicator } from "./ipc-communicator";
import { IpcUdp } from "./ipc-udp";

export class IpcFactory {
    create(configurations: any): IpcCommunicator {
        console.log("conf protocol: " + configurations.protocol);
        if (configurations.protocol == "mqtt")
            return new IpcMqtt(configurations);
        if (configurations.protocol == "udp")
            return new IpcUdp();
        throw new Error(`Undefined ipc protocol: ${configurations.protocol}`);
    }
}