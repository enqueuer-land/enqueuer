import {Formatter} from './formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Injectable} from 'conditional-injector';
import prettyjson from 'prettyjson';
import {ObjectDecycler} from '../../object-notations/object-decycler';

const options = {
    defaultIndentation: 4,
    inlineArrays: true,
    emptyArrayMsg: '-',
    keysColor: 'green',
    dashColor: 'grey'
};

//TODO test it
@Injectable({predicate: (output: any) => output.format && output.format.toUpperCase() === 'CONSOLE'})
export class ConsoleFormatter extends Formatter {

    public format(report: RequisitionModel): string {
        return prettyjson.render(new ObjectDecycler().decycle(report), options);
    }
}
