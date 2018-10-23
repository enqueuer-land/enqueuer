import {Formatter} from './formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Json} from '../../object-notations/json';
import {Injectable} from 'conditional-injector';

//TODO test it
@Injectable({predicate: (output: any) => output.format && output.format.toUpperCase() === 'JSON'})
export class JsonFormatter extends Formatter {
    public format(report: RequisitionModel): string {
        return new Json().stringify(report);
    }
}
