import {Logger} from '../../loggers/logger';
import {DaemonInputRequisition} from './daemon-input-requisition';

export abstract class DaemonInput {
    public abstract subscribe(): Promise<void>;
    public abstract receiveMessage(): Promise<DaemonInputRequisition>;
    public abstract unsubscribe(): Promise<void>;
    public abstract cleanUp(): Promise<void>;
    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        Logger.debug(`DaemonInput does not provide synchronous response`);
        return Promise.resolve();
    }

}