import {Publisher} from './publisher';
import {Injectable} from 'conditional-injector';

@Injectable()
export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        return Promise.reject(`Undefined publishing type to publish: '${this.type}'`);
    }

}