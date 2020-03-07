import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {ProtocolDescriber} from './protocol-describer';

jest.mock('../plugins/dynamic-modules-manager');

const processSendMock = jest.fn();
process.send = processSendMock;

// @ts-ignore
DynamicModulesManager.getInstance.mockImplementation(() => {
    return {
        getProtocolManager: () => ({getProtocolsDescription: () => 'mockedProtocol'})
    };
});
describe('ProtocolDescriber', () => {

    it('should describe protocols when a message arrives', async () => {
        const message = {value: 'value'};
        await new ProtocolDescriber().process(message);

        expect(processSendMock).toHaveBeenCalledWith({event: 'PROTOCOLS_LIST', value: 'mockedProtocol'});
    });


});
