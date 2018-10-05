import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {ProtocolsManager} from '../configurations/protocols-manager';

@Injectable()
export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        ProtocolsManager.suggestPublisherBasedOn(this.type);
        return Promise.reject(`Undefined publisher: '${this.type}'`);
    }
}