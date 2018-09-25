import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';

@Injectable()
export class NullDaemonInput extends DaemonInput {
    private daemonInput: any;

    public constructor(daemonInput: any) {
        super();
        Logger.warning(`Instantiating unknown daemon input: '${daemonInput.type}'`);
        this.daemonInput = daemonInput;
    }

    public async subscribe(onMessageReceived: (requisition: DaemonInputRequisition) => void): Promise<void> {
        throw `Impossible to subscribe to an unknown daemon input: ${this.daemonInput.type}`;
    }

    public unsubscribe(): Promise<void> {
        return Promise.reject(`Impossible to unsubscribe to an unknown daemon input: ${this.daemonInput.type}`);
    }

    public cleanUp(): Promise<void> {
        return Promise.reject(`Impossible to clean up an unknown daemon input: ${this.daemonInput.type}`);
    }

}