import {Injectable} from 'conditional-injector';
import {DaemonInputAdapter} from "./daemon-input-adapter";
import {SubscriptionModel} from "../../models/inputs/subscription-model";
import {Logger} from "../../loggers/logger";

@Injectable({predicate: (subscription: SubscriptionModel) => subscription.type == 'uds'})
export class UdsDaemonInputAdapter extends DaemonInputAdapter {

    public constructor() {
        super();
        Logger.trace(`Instantiating UdsDaemonInputAdapter`);
    }

    public adapt(message: any): string | undefined {
        const payload = message.payload;
        if (payload) {
            return this.stringify(payload);
        } else {
            return this.stringify(message);
        }
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