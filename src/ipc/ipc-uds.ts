import { IpcCommunicator, IpcCommunicatorCallback } from "./ipc-communicator";
import { MessengerService } from "../service/messenger-service";
import { RequisitionParserFactory } from "../service/requisition/requisition-parser-factory";
import { RequisitionParser } from "../service/requisition/requisition-parser";
import { Report } from "../report/report";
import { ReportReplierFactory } from "../report/report-replier-factory";
const ipc = require('node-ipc');

ipc.config.id = 'enqueuer';
ipc.config.retry = 1500;
ipc.config.silent = true;
export class IpcUds implements IpcCommunicator {
 
    private messengerService: MessengerService | null = null;
    
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
        this.messengerService = new RequisitionParserFactory().createService(message);
        if (this.messengerService) {
            this.messengerService.start((report: Report) => this.onFinish(socket, report, message));
        }
    }

    private onFinish(socket: any, report: Report, message: string): void {
        new ReportReplierFactory().createReplierFactory(message)
                    .forEach( reportReplier => reportReplier.report(report));        
        ipc.server.emit(socket, 'message', report.toString());
    }

}