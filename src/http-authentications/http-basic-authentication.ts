import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {isNullOrUndefined} from 'util';

@Injectable({predicate: (authentication: any) => !isNullOrUndefined(authentication.basic)})
export class HttpBasicAuthentication extends HttpAuthentication {

    private user: any;
    private password: any;

    public constructor(authentication: any) {
        super();
        this.user = authentication.basic.user;
        this.password = authentication.basic.password;
    }

    generate(): any {
        return {'authorization': 'Basic ' + Buffer.from(`${this.user}:${this.password}`, 'ascii').toString('base64')};
    }

}