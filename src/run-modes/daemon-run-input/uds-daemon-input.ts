import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {StreamInputHandler} from '../../handlers/stream-input-handler';

//TODO test it
@Injectable({predicate: (daemonInput: any) => daemonInput.type == 'uds'})
export class UdsDaemonInput extends DaemonInput {
    private readonly path: string;
    private readonly type: string;
    private streamHandler: StreamInputHandler;
    // private subscribed: boolean = false;

    public constructor(daemonInput: any) {
        super();
        this.type = daemonInput.type;
        this.path = daemonInput.path || '/tmp/enqueuer.requisitions';
        this.streamHandler = new StreamInputHandler(this.path);
    }

    public async subscribe(onMessageReceived: (requisition: DaemonInputRequisition) => void): Promise<void> {
        await this.streamHandler.subscribe((data: any) => {
            Logger.debug(`UDS daemon server got data`);
            onMessageReceived({
                type: this.type,
                daemon: this,
                input: data.message,
                stream: data.stream
            });
        });
        Logger.info(`Waiting for UDS requisitions: ${this.path}`);
        // this.subscribed = true;
    }

    public async unsubscribe(): Promise<void> {
        Logger.info(`Releasing ${this.path} server`);
        await this.streamHandler.unsubscribe();
        // if (this.subscribed && fs.existsSync(this.path)) {
        //     fs.unlinkSync(this.path);
        // }
        // console.log('HERE3: ' + fs.existsSync(this.path))
    }

    public async cleanUp(requisition: DaemonInputRequisition): Promise<void> {
        return this.streamHandler.close(requisition.stream);
    }

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        return this.streamHandler.sendResponse(message.stream, message.output)
            .then(() => Logger.debug(`UDS daemon server response sent`));
    }
}