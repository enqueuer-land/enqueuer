import { DynamicModulesManager } from './dynamic-modules-manager';
import { entryPoint } from '../outputs/formatters/json-formatter';
import { ProtocolManager } from './protocol-manager';
import { ReportFormatterManager } from './report-formatter-manager';
import { ObjectParserManager } from './object-parser-manager';
import prettyjson from 'prettyjson';

jest.mock('../outputs/formatters/json-formatter');
jest.mock('prettyjson');

describe('DynamicModulesManager', () => {
  beforeEach(() => {
    // @ts-ignore
    delete DynamicModulesManager.instance;
  });

  it('should load every file with an entryPoint function exported', () => {
    const dirname = __dirname.substr(0, __dirname.lastIndexOf('/'));
    const expectedBuiltInModules = [
      'actuators/custom-actuator',
      'actuators/file-actuator',
      'actuators/http-actuator',
      'actuators/standard-output-actuator',
      'actuators/stream-actuator',
      'actuators/udp-actuator',
      'sensors/custom-sensor',
      'sensors/filename-watcher-sensor',
      'sensors/http-sensor',
      'sensors/standard-input-sensor',
      'sensors/stream-sensor',
      'sensors/udp-sensor',
      'outputs/formatters/console-formatter',
      'outputs/formatters/json-formatter',
      'outputs/formatters/yml-formatter',
      'object-parser/json-object-parser',
      'object-parser/csv-object-parser',
      'object-parser/file-object-parser',
      'object-parser/yml-object-parser',
      'asserters/expect-to-be-equal-to-asserter',
      'asserters/expect-to-be-greater-than-asserter',
      'asserters/expect-to-be-greater-than-or-equal-to-asserter',
      'asserters/expect-to-be-less-than-asserter',
      'asserters/expect-to-be-less-than-or-equal-to-asserter',
      'asserters/expect-to-contain-asserter',
      'asserters/expect-to-be-truthy-asserter',
      'asserters/expect-to-be-falsy-asserter',
      'asserters/expect-to-be-any-of-asserter',
      'asserters/expect-to-be-defined-asserter',
      'asserters/expect-to-be-undefined-asserter'
    ].map(expected => dirname + '/' + expected);
    const actualList: string[] = DynamicModulesManager.getInstance().getBuiltInModules();

    expect(actualList.sort()).toEqual(expectedBuiltInModules.sort());
  });

  it('should call entryPoint function', () => {
    const entryPointMock: any = jest.fn();
    // @ts-ignore
    entryPoint.mockImplementationOnce(entryPointMock);

    const dynamicModulesManager = DynamicModulesManager.getInstance();

    // @ts-ignore
    const mainInstance = entryPoint.mock.calls[0][0];

    expect(entryPointMock).toHaveBeenCalled();
    expect(mainInstance.protocolManager).toBeInstanceOf(ProtocolManager);
    expect(mainInstance.reportFormatterManager).toBeInstanceOf(ReportFormatterManager);
    expect(mainInstance.objectParserManager).toBeInstanceOf(ObjectParserManager);
  });

  it('should print loaded modules', done => {
    // @ts-ignore
    prettyjson.render.mockImplementation(printedModules => {
      expect(Array.isArray(printedModules.explicit)).toBeTruthy();
      expect(Array.isArray(printedModules.implicit)).toBeTruthy();
      done();
    });

    DynamicModulesManager.getInstance().describeLoadedModules();
  });

  it('should check enqueuer version of plugins', () => {
    expect(
      // @ts-ignore
      DynamicModulesManager.versionMatches({
        dependencies: { enqueuer: '^6.0.0' }
      })
    ).toBeTruthy();
    expect(
      // @ts-ignore
      DynamicModulesManager.versionMatches({
        devDependencies: { enqueuer: '6.0.0' }
      })
    ).toBeTruthy();
    expect(
      // @ts-ignore
      DynamicModulesManager.versionMatches({
        peerDependencies: { enqueuer: '6.0.0' }
      })
    ).toBeTruthy();
    // @ts-ignore
    expect(DynamicModulesManager.versionMatches({})).toBeFalsy();
  });
});
