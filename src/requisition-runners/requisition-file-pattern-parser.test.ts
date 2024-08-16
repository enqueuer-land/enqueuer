import { RequisitionFilePatternParser } from './requisition-file-pattern-parser';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import { YmlObjectParser } from '../object-parser/yml-object-parser';
import * as fs from 'fs';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('glob');
// @ts-ignore
glob.sync.mockImplementation((pattern: string) => [pattern]);

describe('RequisitionFilePatternParser', () => {
  beforeEach(() => {
    // @ts-ignore
    delete DynamicModulesManager.instance;
  });

  it('Should parse array as just one', () => {
    const requisitionsInput = [
      {
        onInit: {},
        id: 0
      },
      {
        publishers: [{ type: true }],
        name: 'named',
        id: 1
      }
    ];
    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: () => requisitionsInput
        };
      }, 'yml');

    const fileContent = JSON.stringify(requisitionsInput);
    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
    const filename = 'anyStuff';

    const requisition = new RequisitionFilePatternParser([filename]).parse();

    expect(requisition[0].name).toBe(filename);

    expect(requisition[0].requisitions[0].id).toBe(requisitionsInput[0].id);
    expect(requisition[0].requisitions[0].onInit).toEqual(requisitionsInput[0].onInit);

    expect(requisition[0].requisitions[1].name).toBe(requisitionsInput[1].name);
    expect(requisition[0].requisitions[1].id).toBe(requisitionsInput[1].id);
    expect(requisition[0].requisitions[1].publishers).toEqual(requisitionsInput[1].publishers);
  });

  it('Should add invalid file error', () => {
    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => {
      throw 'error';
    });
    const parser: RequisitionFilePatternParser = new RequisitionFilePatternParser(['anyStuff']);

    parser.parse();

    expect(parser.getFilesErrors()[0]).toEqual({
      description: 'error',
      name: "Error parsing file 'anyStuff'",
      valid: false
    });
  });

  it('Should no test found error', () => {
    const parser: RequisitionFilePatternParser = new RequisitionFilePatternParser([]);

    parser.parse();

    expect(parser.getFilesErrors()[0]).toEqual({
      description: 'No test file was found',
      name: 'No test file was found',
      valid: false
    });
  });

  it('Should add if file is not yml nor json', () => {
    const notYml = 'foo bar\nfoo: bar';

    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: value => new YmlObjectParser().parse(value)
        };
      }, 'yml');

    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));

    const parser = new RequisitionFilePatternParser(['anyStuff']);
    parser.parse();

    const parsedErrorDescription: any = parser.getFilesErrors()[0].description;
    expect(parsedErrorDescription.json).toBeDefined();
    expect(parsedErrorDescription.yml).toBeDefined();
  });

  it('Should add error if it is not a valid requisition', () => {
    const notYml = 'hey: bar';

    DynamicModulesManager.getInstance()
      .getObjectParserManager()
      .addObjectParser(() => {
        return {
          parse: value => new YmlObjectParser().parse(value)
        };
      }, 'yml');

    // @ts-ignore
    fs.readFileSync.mockImplementationOnce(() => Buffer.from(notYml));

    const parser = new RequisitionFilePatternParser(['anyStuff']);
    parser.parse();

    expect(parser.getFilesErrors()[0].name).toBe("Error parsing file 'anyStuff'");
  });

  it('should add every not matching file to error', () => {
    // @ts-ignore
    glob.sync.mockReset();
    // @ts-ignore
    glob.sync.mockImplementationOnce(() => []);

    const parser = new RequisitionFilePatternParser(['not-matching-pattern']);
    parser.parse();

    expect(parser.getFilesErrors()[0]).toEqual({
      description: "No file was found with: 'not-matching-pattern'",
      name: "No file was found with: 'not-matching-pattern'",
      valid: false
    });
  });
});
