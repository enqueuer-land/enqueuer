import * as input from '../../models/inputs/requisition-model';
import * as output from '../../models/outputs/requisition-model';
import {DaemonInput} from './daemon-input';

export interface DaemonInputRequisition {
    type: string;
    daemon: DaemonInput;
    input: input.RequisitionModel[];
    output?: output.RequisitionModel;

    [propName: string]: any;
}