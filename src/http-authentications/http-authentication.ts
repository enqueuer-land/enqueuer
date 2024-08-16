import { TestModel } from '../models/outputs/test-model';

export interface HttpAuthentication {
  generate(): any;
  verify(auth: any): TestModel[];
}
