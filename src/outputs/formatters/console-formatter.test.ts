import {RequisitionModel} from '../../models/outputs/requisition-model';
import {ConsoleFormatter, entryPoint} from './console-formatter';

describe('ConsoleFormatter', () => {

    it('Should stringify it', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        } as any;
        const format = new ConsoleFormatter().format(test);

        expect(typeof (format)).toBe('string');
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
