import { Report } from "../report/report";

export type IpcCommunicatorCallback = (report: Report) => void;

export interface IpcCommunicator {
    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void;
}