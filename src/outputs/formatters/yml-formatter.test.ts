import {entryPoint, YmlReportFormatter} from './yml-formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Yaml} from '../../object-notations/yaml';

describe('YmlReportFormatter', () => {

    it('Should stringify it', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        };
        const format = new YmlReportFormatter().format(test);

        expect(typeof (format)).toBe('string');
        expect(format).toBe(new Yaml().stringify(test));
    });

    it('Should export an entry point', done => {
        const mainInstance: any = {
            reportFormatterManager: {
                addReportFormatter: (createFunction: any, ...tags: any) => {
                    expect(createFunction()).toBeInstanceOf(YmlReportFormatter);
                    expect(tags).toEqual(['yml', 'yaml']);
                    done();
                }
            }
        };

        entryPoint(mainInstance);

    });

});
