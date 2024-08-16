import { TestModel } from './test-model';

export interface HookModel {
    arguments?: { [name: string]: any };
    tests: TestModel[];
    valid: boolean;
}
