import {DynamicModulesManager} from './dynamic-modules-manager';
import {entryPoint} from '../outputs/formatters/json-formatter';
import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';

jest.mock('../outputs/formatters/json-formatter');

describe('DynamicModulesManager', () => {
    beforeEach(() => {
        // @ts-ignore
        delete DynamicModulesManager.instance;
    });

    it('should load every file with an entryPoint function exported', () => {
        const expectedBuiltInModules = [
            '../publishers/custom-publisher',
            '../publishers/file-publisher',
            '../publishers/http-publisher',
            '../publishers/standard-output-publisher',
            '../publishers/stream-publisher',
            '../publishers/udp-publisher',
            '../subscriptions/custom-subscription',
            '../subscriptions/filename-watcher-subscription',
            '../subscriptions/http-subscription',
            '../subscriptions/standard-input-subscription',
            '../subscriptions/stream-subscription',
            '../subscriptions/udp-subscription',
            '../outputs/formatters/console-formatter',
            '../outputs/formatters/json-formatter',
            '../outputs/formatters/yml-formatter'
        ];
        const actualList: string[] = DynamicModulesManager.getInstance().getBuiltInModules();

        expect(expectedBuiltInModules.length).toBe(actualList.length);

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

    });
});
