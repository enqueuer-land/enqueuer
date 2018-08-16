import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {isNullOrUndefined} from 'util';
import {TestModel} from '../models/outputs/test-model';

@Injectable({predicate: (authentication: any) => !isNullOrUndefined(authentication.basic)})
export class HttpBasicAuthentication extends HttpAuthentication {

    private user: any;
    private password: any;
    private tests: TestModel[] = [];

    public constructor(authentication: any) {
        super();
        this.user = authentication.basic.user;
        this.password = authentication.basic.password;
    }

    public generate(): any {
        return {'authorization': 'Basic ' + Buffer.from(`${this.user}:${this.password}`, 'ascii').toString('base64')};
    }

    public verify(authorization: string): TestModel[] {
        this.tests = [];
        const plainAuth = new Buffer(authorization.split(' ')[1], 'base64').toString(); //decode
        const credentials = plainAuth.split(':');

        this.tests.push(this.authenticatePrefix(authorization.split(' ')[0]));
        this.tests.push(this.authenticateUser(credentials[0]));
        this.tests.push(this.authenticatePassword(credentials[1]));
        this.tests.push(this.basicAuthentication());

        return this.tests;
    }

    private basicAuthentication() {
        let test = {
            name: '"Basic" authentication',
            valid: false,
            description: 'Fail to authenticate \'Basic\' authentication'
        };
        if (this.tests.every(test => test.valid)) {
            test.valid = true;
            test.description = `Basic authentication is valid`;
        }
        return test;
    }

    private authenticatePrefix(prefix: string) {
        let test = {
            name: '"Basic" authentication prefix',
            valid: false,
            description: `Prefix "Basic" was not found in Basic authentication. Got ${prefix} instead`
        };
        if (prefix == 'Basic') {
            test.valid = true;
            test.description = `Prefix "Basic" was found.`;
        }
        return test;
    }

    private authenticateUser(user: string) {
        let test = {
            name: '"Basic" authentication user',
            valid: false,
            description: `User was not found. Got ${user} instead`
        };
        if (user == this.user) {
            test.valid = true;
            test.description = `User found`;
        }
        return test;
    }

    private authenticatePassword(pass: string) {
        let test = {
            name: '"Basic" authentication password',
            valid: false,
            description: `Password does not match. Got ${pass} instead`
        };
        if (pass == this.password) {
            test.valid = true;
            test.description = `Password matchs`;
        }
        return test;
    }
}