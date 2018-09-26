import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';
import {DependencyManager} from '../configurations/dependency-manager';

@Injectable()
export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        return Promise.reject(`Undefined publishing: '${this.type}'. Trying installing one of: ${new DependencyManager()
            .listAvailable()} with 'nqr -i $(protocol)'`);
    }

}