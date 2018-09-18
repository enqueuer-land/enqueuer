import {Injectable} from 'conditional-injector';
import {DaemonInputAdapter} from './daemon-input-adapter';
import {Logger} from '../../loggers/logger';

@Injectable({
    predicate: (type: string) => type === 'http-proxy' ||
                                type === 'https-proxy' ||
                                type === 'http-server' ||
                                type === 'https-server'
})
export class HttpDaemonInputAdapter extends DaemonInputAdapter {

    public constructor() {
        super();
        Logger.trace(`Instantiating HttpDaemonInputAdapter`);
    }

    public adapt(message: any): string {
        const payload = message.body;
        return this.stringify(payload);
    }

    private stringify(message: any): string {
        const messageType = typeof(message);
        if (messageType == 'string') {
            return message;
        } else if (Buffer.isBuffer(message)) {
            return Buffer.from(message).toString();
        } else {
            return JSON.stringify(message);
        }
    }
}