import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {TestModel} from '../models/outputs/test-model';
import {Logger} from '../loggers/logger';

@Injectable({predicate: (authentication: any) => authentication.bearer && authentication.bearer.token})
export class HttpBearerAuthentication extends HttpAuthentication {

    private token: any;
    private tests: TestModel[] = [];

    public constructor(authentication: any) {
        super();
        this.token = authentication.bearer.token;
    }

    public generate(): any {
        return {'authorization': 'Bearer ' + this.token};
    }

    public verify(authorization: string): TestModel[] {
        try {
            this.tests = [];
            const token = authorization.split(' ')[1];
            this.tests.push(this.authenticatePrefix(authorization.split(' ')[0]));
            this.tests.push(this.authenticateToken(token));
        } catch (err) {
            Logger.error(`Error trying to authenticate: ${err}`);
        }
        this.tests.push(this.bearerAuthentication());

        return this.tests;
    }

    private bearerAuthentication() {
        let test = {
            name: '"Bearer" authentication',
            valid: false,
            description: 'Fail to authenticate \'Bearer\' authentication'
        };
        if (this.tests.length > 0) {
            if (this.tests.every(test => test.valid)) {
                test.valid = true;
                test.description = `Bearer authentication is valid`;
            }
        }
        return test;
    }

    private authenticatePrefix(prefix: string) {
        let test = {
            name: '"Bearer" authentication prefix',
            valid: false,
            description: `Prefix "Bearer" was not found in Bearer authentication. Got ${prefix} instead`
        };
        if (prefix == 'Bearer') {
            test.valid = true;
            test.description = `Prefix "Bearer" was found.`;
        }
        return test;
    }

    private authenticateToken(token: string) {
        let test = {
            name: '"Bearer" authentication token',
            valid: false,
            description: `Token does not match. Got ${token} instead`
        };
        if (token == this.token) {
            test.valid = true;
            test.description = `Token match`;
        }
        return test;
    }
}