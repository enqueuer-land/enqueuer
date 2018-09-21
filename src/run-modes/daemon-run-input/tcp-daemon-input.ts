import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {StreamInputHandler} from '../../handlers/stream-input-handler';
import {RequisitionModel} from '../../models/inputs/requisition-model';

//TODO test it
@Injectable({predicate: (daemonInput: any) => daemonInput.type == 'tcp'})
export class TcpDaemonInput extends DaemonInput {
    private port: number;
    private type: string;
    private streamHandler: StreamInputHandler;

    public constructor(daemonInput: any) {
        super();
        this.type = daemonInput.type;
        this.port = daemonInput.port || 23022;
        this.streamHandler = new StreamInputHandler(this.port);
    }

    public async subscribe(onMessageReceived: (requisition: DaemonInputRequisition) => void): Promise<void> {
        await this.streamHandler.subscribe((data: any) => {
            Logger.debug(`TCP daemon server got data`);
            onMessageReceived({
                type: this.type,
                daemon: this,
                input: data.message,
                stream: data.stream
            });
        });
        Logger.info(`Waiting for TCP requisitions: ${this.port}`);
    }

    public unsubscribe(): Promise<void> {
        Logger.info(`Releasing ${this.port} server`);
        return this.streamHandler.unsubscribe();
    }

    public async cleanUp(requisition: DaemonInputRequisition): Promise<void> {
        return this.streamHandler.close(requisition.stream);
    }

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        return this.streamHandler.sendResponse(message.stream, message.output)
            .then(() => Logger.debug(`TCP daemon server response sent`));
    }
}