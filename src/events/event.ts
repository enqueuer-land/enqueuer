import {Assertion} from '../testers/assertion';

export interface Event {
    script: string;
    assertions: Assertion[];
}