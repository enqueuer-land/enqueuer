import {RequisitionModel} from '../../models/outputs/requisition-model';
import {entryPoint, JsonReportFormatter} from './json-formatter';
import {Json} from '../../object-notations/json';

describe('JsonReportFormatter', () => {

    it('Should stringify it', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        };
        const format = new JsonReportFormatter().format(test);

        expect(typeof (format)).toBe('string');
        expect(format).toBe(new Json().stringify(test));
    });

    it('Should export an entry point', done => {
        const mainInstance: any = {
            reportFormatterManager: {
                addReportFormatter: (createFunction: any, ...tags: any) => {
                    expect(createFunction()).toBeInstanceOf(JsonReportFormatter);
                    expect(tags).toEqual(['json']);
                    done();
                }
            }
        };

        entryPoint(mainInstance);

    });

});
