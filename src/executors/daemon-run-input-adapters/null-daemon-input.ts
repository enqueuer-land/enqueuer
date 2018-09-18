import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {DaemonInputRequisition} from './daemon-input-requisition';

@Injectable()
export class NullDaemonInput extends DaemonInput {
    private daemonInput: any;

    public constructor(daemonInput: any) {
        super();
        Logger.warning(`Instantiating unknown daemon input from "${JSON.stringify(daemonInput)}`);
        this.daemonInput = daemonInput;
    }

    public subscribe(): Promise<void> {
        return Promise.reject(`Impossible to subscribe to an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }

    public receiveMessage(): Promise<DaemonInputRequisition> {
        return Promise.reject(`Impossible to receive message from an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }

    public unsubscribe(): Promise<void> {
        return Promise.reject(`Impossible to unsubscribe to an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }

    public cleanUp(): Promise<void> {
        return Promise.reject(`Impossible to clean up an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }

}