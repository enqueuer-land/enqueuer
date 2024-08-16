import { Assertion } from '../models/events/assertion';
import { TestModel } from '../models/outputs/test-model';

export interface Asserter {
  assert(assertion: Assertion, literal: any): TestModel;
}
