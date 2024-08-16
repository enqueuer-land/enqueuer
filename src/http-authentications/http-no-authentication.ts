import { HttpAuthentication } from './http-authentication';
import { TestModel } from '../models/outputs/test-model';

export class HttpNoAuthentication implements HttpAuthentication {
    private readonly authentication: any;

    public constructor(authentication: any) {
        this.authentication = authentication;
    }

    public generate(): any {
        return null;
    }

    public verify(requisition: string): TestModel[] {
        return [
            {
                name: 'Http authentication',
                description: `No supported http authentication method was found from: ${this.authentication}`,
                valid: false
            }
        ];
    }
}
