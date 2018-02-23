import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { MessengerService } from "../service/messenger-service";
import { Report } from "../report/report";
import { CommandLineParser } from "../command-line/command-line-parser";
import { ReportReplierFactory } from "../report/report-replier-factory";
import { ReportReplier } from "../report/report-replier";
import { RequisitionParser } from "../service/requisition/requisition-parser";
const fs = require("fs");

export class InputRequisitionFile implements IpcCommunicator {
    
    private reportRepliers: ReportReplier[] = [];
    private messengerService: MessengerService | null = null;
    private ipcCommunicatorCallback: IpcCommunicatorCallback | null = null;
    
    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        this.ipcCommunicatorCallback = ipcCommunicatorCallback;
        
        const fileContent: string = fs
            .readFileSync(CommandLineParser.getInstance().getOptions().inputRequisitionFile);
        this.reportRepliers = new ReportReplierFactory().createReplierFactory(fileContent.toString());

        this.messengerService = new RequisitionParser().createService(fileContent);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(report, fileContent));
        }
    }

    private onFinish(report: Report, fileContent: string): any {
        this.reportRepliers.forEach( reportReplier => reportReplier.report(report));        
        if (this.ipcCommunicatorCallback)
            this.ipcCommunicatorCallback(report);
    }

}