import {Injectable} from 'conditional-injector';
import {HttpAuthentication} from './http-authentication';
import {TestModel} from '../models/outputs/test-model';

@Injectable()
export class HttpNoAuthentication extends HttpAuthentication {
    private authentication: any;

    public constructor(authentication: any) {
        super();
        this.authentication = authentication;
    }

    generate(): any {
        return null;
    }

    public verify(requisition: string): TestModel[] {
        return [{
                    name: 'Http authentication',
                    description: `No supported http authentication method was found from: ${this.authentication}`,
                    valid: false
        }];
    }

}