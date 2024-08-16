import { entryPoint, YmlReportFormatter } from './yml-formatter';
import { RequisitionModel } from '../../models/outputs/requisition-model';
import { YmlObjectParser } from '../../object-parser/yml-object-parser';

describe('YmlReportFormatter', () => {
  it('Should stringify it', () => {
    const test: RequisitionModel = {
      name: 'name',
      valid: true,
      tests: []
    } as any;
    const format = new YmlReportFormatter().format(test);

    expect(typeof format).toBe('string');
    expect(format).toBe(new YmlObjectParser().stringify(test));
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
