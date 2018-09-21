import {Logger} from '../../loggers/logger';
import {DaemonInputRequisition} from './daemon-input-requisition';

export abstract class DaemonInput {
    public abstract subscribe(onMessageReceived: (requisition: DaemonInputRequisition) => void): void;
    public abstract unsubscribe(): Promise<void>;
    public abstract cleanUp(requisition: DaemonInputRequisition): Promise<void>;
    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        Logger.debug(`DaemonInput does not provide synchronous response`);
        return Promise.resolve();
    }

}