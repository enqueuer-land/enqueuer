import {Assertion} from './assertion';

export interface Event {
    script?: string;
    assertions?: Assertion[];
    store: {[propName: string]: any; };
}