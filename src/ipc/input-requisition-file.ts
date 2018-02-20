const fs = require("fs");
import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { RequisitionParserFactory } from "../service/requisition/requisition-parser-factory";
import { MessengerService } from "../service/messenger-service";
import { Report } from "../report/report";
import { CommandLineParser } from "../command-line/command-line-parser";

export class InputRequisitionFile implements IpcCommunicator {

    private messengerService: MessengerService | null = null;
    private ipcCommunicatorCallback: IpcCommunicatorCallback | null = null;

    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        console.log("starting ipc-input-file-requisition");
        this.ipcCommunicatorCallback = ipcCommunicatorCallback;
        const fileContent: string = fs.readFileSync(CommandLineParser.getOptions().inputFilename);

        this.messengerService = new RequisitionParserFactory().createService(fileContent);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(report));
        }
    }

    private onFinish(report: Report): any {
        if (CommandLineParser.getOptions().outputFilename)
            fs.writeFileSync(CommandLineParser.getOptions(), report.toString());
        if (this.ipcCommunicatorCallback)
            this.ipcCommunicatorCallback(report.hasErrors()? 1: 0);
    }

}