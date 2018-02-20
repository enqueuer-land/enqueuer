const fs = require("fs");
import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { RequisitionParserFactory } from "../service/requisition/requisition-parser-factory";
import { MessengerService } from "../service/messenger-service";
import { Report } from "../report/report";

process.stdin.resume();
process.stdin.setEncoding('utf8');
export class IpcStandardInput implements IpcCommunicator {

    private requisition: string = "";
    private messengerService: MessengerService | null = null;
    private ipcCommunicatorCallback: IpcCommunicatorCallback | null = null;

    constructor() {

    }

    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        console.log("starting ipc-input-file-requisition");
        this.ipcCommunicatorCallback = ipcCommunicatorCallback;
        console.log("reading requisition from standard input");

        process.stdin.on('data', (chunk) => this.requisition += chunk);
        process.stdin.on('end', () => this.startService());
        
    }
    
    private startService(): void {
        this.messengerService = new RequisitionParserFactory().createService(this.requisition);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(report));
        }
    }

    private onFinish(report: Report): any {
        if (this.ipcCommunicatorCallback)
            this.ipcCommunicatorCallback(report.hasErrors()? 1: 0);
    }

}