import {DaemonInput} from './daemon-input';

export interface DaemonInputRequisition {
    type: string;
    daemon: DaemonInput;
    input: string;
    output?: any;

    [propName: string]: any;
}