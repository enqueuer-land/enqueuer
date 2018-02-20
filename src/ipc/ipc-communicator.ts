export type IpcCommunicatorCallback = (result: number) => void;

export interface IpcCommunicator {
    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void;
}