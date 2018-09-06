import {Injectable} from 'conditional-injector';
import {DaemonInputAdapter} from './daemon-input-adapter';
import {Logger} from '../../loggers/logger';

@Injectable({predicate: (type: string) => type == 'uds'})
export class UdsDaemonInputAdapter extends DaemonInputAdapter {

    public constructor() {
        super();
        Logger.trace(`Instantiating UdsDaemonInputAdapter`);
    }

    public adapt(message: any): string {
        const payload = message.payload;
        let stringify;
        if (payload) {
            stringify = this.stringify(payload);
        } else {
            stringify = this.stringify(message);
        }
        if (stringify) {
            return stringify;
        }
        throw 'Uds daemon input can not adapt received message';
    }

    private stringify(message: any): string | undefined {
        const messageType = typeof(message);
        if (messageType == 'string') {
            return message;
        } else if (Buffer.isBuffer(message)) {
            return Buffer.from(message).toString();
        }
    }
}