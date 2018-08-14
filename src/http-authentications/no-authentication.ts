import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';

@Injectable()
export class NoAuthentication extends HttpAuthentication {

    public constructor() {
        super();
    }

    generate(): any {
        Logger.warning('No authentication method was found to authenticate a HTTP requisition');
        return null;
    }

    public verify(requisition: string): TestModel[] {
        Logger.warning('No authentication method was found to verify an HTTP authentication');
        return [];
    }

}