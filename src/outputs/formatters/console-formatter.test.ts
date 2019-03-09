import {RequisitionModel} from '../../models/outputs/requisition-model';
import {ConsoleFormatter, entryPoint} from './console-formatter';
import prettyjson from 'prettyjson';
import {getPrettyJsonConfig} from '../prettyjson-config';
import {ObjectDecycler} from '../../object-parser/object-decycler';

describe('ConsoleFormatter', () => {

    it('Should stringify it', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        };
        const format = new ConsoleFormatter().format(test);

        expect(typeof (format)).toBe('string');
        expect(format).toBe(prettyjson.render(new ObjectDecycler().decycle(test), getPrettyJsonConfig()));
    });

    it('Should export an entry point', done => {
        const mainInstance: any = {
            reportFormatterManager: {
                addReportFormatter: (createFunction: any, ...tags: any) => {
                    expect(createFunction()).toBeInstanceOf(ConsoleFormatter);
                    expect(tags).toEqual(['console', 'stdout']);
                    done();
                }
            }
        };

        entryPoint(mainInstance);

    });

});
