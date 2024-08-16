import { MainInstance } from '../plugins/main-instance';
import { FileObjectParserTest, entryPoint } from './file-object-parser';

describe('FileObjectParserTest', () => {
  test('should parse', () => {
    const code = 'anyStuff';

    const parsed: any = new FileObjectParserTest().parse(code);

    expect(code).toBe(code);
  });

  it('Should export an entry point', done => {
    const mainInstance: MainInstance = {
      // @ts-ignore
      objectParserManager: {
        addObjectParser: (createFunction: any, ...tags: any) => {
          expect(createFunction()).toBeInstanceOf(FileObjectParserTest);
          expect(tags.sort()).toEqual(['file'].sort());
          done();
        }
      }
    };
    entryPoint(mainInstance);
  });
});
