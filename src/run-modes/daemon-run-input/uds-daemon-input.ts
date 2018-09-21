import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {StreamDaemonInput} from './stream-daemon-input';
import {RequisitionModel} from '../../models/inputs/requisition-model';
import * as fs from 'fs';

//TODO test it
@Injectable({predicate: (daemonInput: any) => daemonInput.type == 'uds'})
export class UdsDaemonInput extends DaemonInput {
    private path: string;
    private type: string;
    private streamDaemon: StreamDaemonInput;
    private subscribed: boolean = false;

    public constructor(daemonInput: any) {
        super();
        this.type = daemonInput.type;
        this.path = daemonInput.path || '/tmp/enqueuer.requisitions';
        this.streamDaemon = new StreamDaemonInput(this.path);
    }

    public subscribe(): Promise<void> {
        return this.streamDaemon.subscribe()
            .then(() => {
                this.subscribed = true;
                Logger.info(`Waiting for UDS requisitions: ${this.path}`);
            });
    }

    public receiveMessage(): Promise<DaemonInputRequisition> {
        return this.streamDaemon.receiveMessage()
            .then((input: string) => {
                Logger.debug(`UDS daemon server got data`);
                return {
                    type: this.type,
                    daemon: this,
                    input: input
                };
            });
    }

    public unsubscribe(): Promise<void> {
        if (!this.subscribed) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            fs.unlink(this.path, () => {
                resolve(this.streamDaemon.unsubscribe());
            });
        });
    }

    public async cleanUp(): Promise<void> {
        /* do nothing */
    }

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        return this.streamDaemon.sendResponse(message.output)
            .then(() => Logger.debug(`UDS daemon server response sent`));
    }
}