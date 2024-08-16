import { RequisitionModel } from '../../models/outputs/requisition-model';
import { entryPoint, JsonReportFormatter } from './json-formatter';
import { JsonObjectParser } from '../../object-parser/json-object-parser';

describe('JsonReportFormatter', () => {
    it('Should stringify it', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        } as any;
        const format = new JsonReportFormatter().format(test);

        expect(typeof format).toBe('string');
        expect(format).toBe(new JsonObjectParser().stringify(test));
    });

    it('Should throw', () => {
        const test: RequisitionModel = {
            name: 'name',
            valid: true,
            tests: []
        } as any;
        test.cycle = test;
        expect(() => new JsonReportFormatter().format(test)).toThrow();
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
