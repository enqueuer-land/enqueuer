import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {isNullOrUndefined} from 'util';

@Injectable()
export class NoAuthentication extends HttpAuthentication {

    public constructor() {
        super();
    }

    generate(): any {
        return null;
    }

}