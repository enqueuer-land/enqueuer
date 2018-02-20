const fs = require("fs");
import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { RequisitionParserFactory } from "../service/requisition/requisition-parser-factory";
import { MessengerService } from "../service/messenger-service";
import { Report } from "../report/report";

export class InputRequisitionFile implements IpcCommunicator {

    private messengerService: MessengerService | null = null;
    private ipcCommunicatorCallback: IpcCommunicatorCallback | null = null;
    private inputFilename: string = "";
    private outputFilename: string = "";

    constructor(inputFilename: string, outputFilename: string) {
        this.inputFilename = inputFilename;
        this.outputFilename = outputFilename;
    }

    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        console.log("starting ipc-input-file-requisition");
        this.ipcCommunicatorCallback = ipcCommunicatorCallback;
        const fileContent: string = fs.readFileSync(this.inputFilename);

        this.messengerService = new RequisitionParserFactory().createService(fileContent);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(report));
        }
    }

    private onFinish(report: Report): any {
        if (this.outputFilename)
            fs.writeFileSync(this.outputFilename, report.toString());
        else
            report.print();
        if (this.ipcCommunicatorCallback)
            this.ipcCommunicatorCallback(report.hasErrors()? 1: 0);
    }

}