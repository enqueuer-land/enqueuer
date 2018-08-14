import {TestModel} from '../models/outputs/test-model';

export abstract class HttpAuthentication {
    public abstract generate(): any;
    public abstract verify(auth: any): TestModel[];
}