import {Formatter} from './formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Yaml} from '../../object-notations/yaml';
import {Injectable} from 'conditional-injector';

//TODO test it
@Injectable()
export class YmlFormatter extends Formatter {
    public format(report: RequisitionModel): string {
        return new Yaml().stringify(report);
    }
}
