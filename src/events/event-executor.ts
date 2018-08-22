import {TestModel} from '../models/outputs/test-model';

export interface EventExecutor {
    execute(): TestModel[];
}
