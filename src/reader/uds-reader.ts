import { RequisitionReader } from "./requisition-reader";
const ipc = require('node-ipc');

ipc.config.id = 'enqueuer';
ipc.config.retry = 1500;
ipc.config.silent = true;
export class UdsReader implements RequisitionReader {

    constructor() {
        ipc.serve();
        ipc.server.start();
    }

    public start(): Promise<string> {
        console.log("Starting UdsReader");
        return new Promise((resolve, reject) => {
            ipc.server.on('enqueuer-client', (message: string, socket: any) => {
                console.log("UdsReader got a requisition");
                resolve(message);
            });
            ipc.server.on('error', (error: any) => {
                reject(error);
            });

        });
    }

    public stop(): void {
        // ipc.server.end();
        // ipc.server.emit(socket, 'messageReceived', report.toString());
    }
}