import {Test} from '../testers/test';

export interface EventExecutor {
    execute(): Test[];
}
