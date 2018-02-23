import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { MessengerService } from "../service/messenger-service";
import { RequisitionParser } from "../service/requisition/requisition-parser";
import { Report } from "../report/report";
import { ReportReplierFactory } from "../report/report-replier-factory";
import { ReportReplier } from "../report/report-replier";
const ipc = require('node-ipc');

ipc.config.id = 'enqueuer';
ipc.config.retry = 1500;
ipc.config.silent = true;
export class IpcUds implements IpcCommunicator {
 
    private messengerService: MessengerService | null = null;
    private reportRepliers: ReportReplier[] = [];

    start(ipcCommunicatorCallback: IpcCommunicatorCallback): void {
        console.log("starting ipc-uds");

        ipc.serve(() => this.onConnect());
        ipc.server.start();
    }

    stop(): void {
        ipc.server.end();
    }
    
    private onConnect(): void {
        ipc.server.on('enqueuer-client', (message: string, socket: any) => this.onMessageReceived(message, socket));
    }

    private onMessageReceived(message: string, socket: any): void {
        this.messengerService = new RequisitionParser().createService(message);
        this.reportRepliers = new ReportReplierFactory().createReplierFactory(message);                
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(socket, report, message));
        }
    }

    private onFinish(socket: any, report: Report, message: string): void {
        this.reportRepliers.forEach( reportReplier => reportReplier.report(report));
        ipc.server.emit(socket, 'message', report.toString());
    }

}