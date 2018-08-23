import {Assertion} from './assertion';

export interface Event {
    script?: string;
    assertions?: Assertion[];
}