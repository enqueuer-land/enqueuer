import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {isNullOrUndefined} from 'util';
import {TestModel} from '../models/outputs/test-model';

@Injectable({predicate: (authentication: any) => !isNullOrUndefined(authentication.basic)})
export class HttpBasicAuthentication extends HttpAuthentication {

    private user: any;
    private password: any;

    public constructor(authentication: any) {
        super();
        this.user = authentication.basic.user;
        this.password = authentication.basic.password;
    }

    public generate(): any {
        return {'authorization': 'Basic ' + Buffer.from(`${this.user}:${this.password}`, 'ascii').toString('base64')};
    }

    public verify(authorization: string): TestModel[] {
        const plainAuth = new Buffer(authorization.split(' ')[1], 'base64').toString(); //decode
        const credentials = plainAuth.split(':');

        let tests: TestModel[] = [];
        tests.push(this.authenticatePrefix(authorization.split(' ')[0]));
        tests.push(this.authenticateUser(credentials[0]));
        tests.push(this.authenticatePassword(credentials[1]));
        return tests;
    }

    private authenticatePrefix(prefix: string) {
        let test = {
            name: '"Basic" authentication prefix',
            valid: false,
            description: 'Prefix "Basic" was not found in Basic authentication'
        };
        if (prefix == 'Basic') {
            test.valid = true;
            test.description = `Prefix "Basic" was not found. Got ${prefix} instead`;
        }
        return test;
    }

    private authenticateUser(user: string) {
        let test = {
            name: '"Basic" authentication user',
            valid: false,
            description: 'Basic user was not found'
        };
        if (user == this.user) {
            test.valid = true;
            test.description = `User was not found. Got ${user} instead`;
        }
        return test;
    }

    private authenticatePassword(pass: string) {
        let test = {
            name: '"Basic" authentication password',
            valid: false,
            description: 'Basic password does not match'
        };
        if (pass == this.password) {
            test.valid = true;
            test.description = `Password does not match. Got ${pass} instead`;
        }
        return test;
    }
}