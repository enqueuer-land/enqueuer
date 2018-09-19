import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {StreamDaemonInput} from './stream-daemon-input';
import * as fs from 'fs';

//TODO test it
@Injectable({predicate: (daemonInput: any) => daemonInput.type == 'uds'})
export class UdsDaemonInput extends DaemonInput {
    private path: string;
    private type: string;
    private streamDaemon: StreamDaemonInput;

    public constructor(daemonInput: any) {
        super();
        this.type = daemonInput.type;
        this.path = daemonInput.path || '/tmp/enqueuer.requisitions';
        this.streamDaemon = new StreamDaemonInput(this.path);
    }

    public subscribe(): Promise<void> {
        return this.streamDaemon.subscribe()
            .then(() => {
                Logger.info(`Waiting for UDS requisitions: ${this.path}`);
            });
    }

    public receiveMessage(): Promise<DaemonInputRequisition> {
        return this.streamDaemon.receiveMessage()
            .then((requisition: DaemonInputRequisition) => {
                Logger.debug(`UDS server got data`);
                requisition.type = this.type;
                requisition.daemon = this;
                return requisition;
            });
    }

    public unsubscribe(): Promise<void> {
        return new Promise((resolve) => {
            fs.unlink(this.path, () => {
                resolve(this.streamDaemon.unsubscribe());
            });
        });
    }

    public cleanUp(): Promise<void> {
        return this.streamDaemon.cleanUp();
    }

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        return this.streamDaemon.sendResponse(message)
            .then(() => Logger.debug(`UDS daemon server response sent`));
    }
}