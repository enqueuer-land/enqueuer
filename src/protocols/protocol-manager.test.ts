import {ProtocolManager} from "./protocol-manager";
import '../injectable-files-list'
import "../publishers/zeromq-publisher";
import {Protocol} from "./protocol";

let logMock = jest.fn();
// @ts-ignore
global.console = {log: logMock};
describe('ProtocolManager', () => {

    it('printAvailable', () => {
        ProtocolManager.getInstance().insertPublisher(new Protocol('amqp'));
        ProtocolManager.getInstance().printAvailable();
        expect(logMock).toHaveBeenCalledTimes(1);
    });


});