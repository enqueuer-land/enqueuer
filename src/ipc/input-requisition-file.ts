import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { MessengerService } from "../service/messenger-service";
import { Report } from "../report/report";
import { CommandLineParser } from "../command-line/command-line-parser";
import { ReportReplierFactory } from "../report/report-replier-factory";
import { ReportReplier } from "../report/report-replier";
import { RequisitionParser } from "../service/requisition/requisition-parser";
import {Requisition} from "../service/requisition/requisition";
import {EnqueuerService} from "../service/enqueuer-service";
const fs = require("fs");

export class InputRequisitionFile implements IpcCommunicator {
    
    private reportRepliers: ReportReplier[] = [];
    private messengerService: MessengerService | null = null;
    private ipcCommunicatorCallback: IpcCommunicatorCallback | null = null;
    
    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        this.ipcCommunicatorCallback = ipcCommunicatorCallback;
        
        const fileContent: string = fs
            .readFileSync(CommandLineParser.getInstance().getOptions().inputRequisitionFile);

        const parsedRequisition: Requisition = new RequisitionParser().parse(fileContent);
        this.messengerService = new EnqueuerService(parsedRequisition);
        this.reportRepliers = new ReportReplierFactory().createReplierFactory(parsedRequisition);
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