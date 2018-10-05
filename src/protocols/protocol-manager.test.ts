import {ProtocolManager} from "./protocol-manager";
import '../injectable-files-list'
import "../publishers/zeromq-publisher";

let logMock = jest.fn();
// @ts-ignore
global.console = {log: logMock};
describe('ProtocolManager', () => {

    it('printAvailable', () => {
        ProtocolManager.getInstance().insertPublisherProtocol('amqp');
        ProtocolManager.getInstance().insertSubscriptionProtocol('amqp', ['IEI', 'AMQP']);
        ProtocolManager.getInstance().printAvailable();
        expect(logMock).toHaveBeenCalledTimes(3);
    });


});