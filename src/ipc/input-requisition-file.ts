const fs = require("fs");
import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { RequisitionParserFactory } from "../service/requisition/requisition-parser-factory";
import { MessengerService } from "../service/messenger-service";
import { Report } from "../report/report";
import { CommandLineParser } from "../command-line/command-line-parser";
import { ReportReplierFactory } from "../report/report-replier-factory";

export class InputRequisitionFile implements IpcCommunicator {

    private messengerService: MessengerService | null = null;
    private ipcCommunicatorCallback: IpcCommunicatorCallback | null = null;

    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        this.ipcCommunicatorCallback = ipcCommunicatorCallback;
        
        const fileContent: string = fs.readFileSync(CommandLineParser.getInstance().getOptions().inputRequisitionFile);

        this.messengerService = new RequisitionParserFactory().createService(fileContent);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(report, fileContent));
        }
    }

    private onFinish(report: Report, fileContent: string): any {
        new ReportReplierFactory().createReplierFactory(fileContent)
                    .forEach( reportReplier => reportReplier.report(report));        
        if (this.ipcCommunicatorCallback)
            this.ipcCommunicatorCallback(report);
    }

}