import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {StreamDaemonInput} from './stream-daemon-input';

//TODO test it
@Injectable({predicate: (daemonInput: any) => daemonInput.type == 'tcp'})
export class TcpDaemonInput extends DaemonInput {
    private port: number;
    private type: string;
    private streamDaemon: StreamDaemonInput;

    public constructor(daemonInput: any) {
        super();
        this.type = daemonInput.type;
        this.port = daemonInput.port || 23022;
        this.streamDaemon = new StreamDaemonInput(this.port);
    }

    public subscribe(): Promise<void> {
        return this.streamDaemon.subscribe()
            .then(() => Logger.info(`Waiting for TCP requisitions: ${this.port}`));
    }

    public receiveMessage(): Promise<DaemonInputRequisition> {
        return this.streamDaemon.receiveMessage()
            .then((requisition: DaemonInputRequisition) => {
                Logger.debug(`TCP server got data`);
                requisition.type = this.type;
                requisition.daemon = this;
                return requisition;
            });
    }

    public unsubscribe(): Promise<void> {
        return this.streamDaemon.unsubscribe();
    }

    public cleanUp(): Promise<void> {
        return this.streamDaemon.cleanUp();
    }

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        return this.streamDaemon.sendResponse(message)
            .then(() => Logger.debug(`TCP daemon server response sent`));
    }
}