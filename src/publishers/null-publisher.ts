import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {ProtocolManager} from '../protocols/protocol-manager';

@Injectable()
export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        ProtocolManager.getInstance().suggestSimilarPublishers(this.type);
        return Promise.reject(`Undefined publisher: '${this.type}'`);
    }
}