import {ProtocolManager} from "./protocol-manager";
import '../injectable-files-list'
import {Protocol} from "./protocol";
import prettyjson from "prettyjson";
jest.mock('prettyjson')

const render = jest.fn();
prettyjson.render.mockImplementation(render);

describe('ProtocolManager', () => {

    beforeEach(() => {
        // @ts-ignore
        ProtocolManager.instance = null;
        render.mockClear();
    });

    it('describeProtocols', () => {
        ProtocolManager.getInstance().describeProtocols(true);
        expect(render).toHaveBeenCalledWith({protocols: {publishers: expect.anything(), subscriptions: expect.anything()}}, expect.anything());
    });

    it('describe given publisher Protocol', () => {
        ProtocolManager.getInstance().insertSubscription(new Protocol('pub'));
        ProtocolManager.getInstance().describeProtocols('pub');
        expect(render).toHaveBeenCalledWith({publishers: expect.anything(), subscriptions: {pub: expect.anything()}}, expect.anything());
    });

    it('describe given subscription Protocol', () => {
        ProtocolManager.getInstance().insertSubscription(new Protocol('sub'));
        ProtocolManager.getInstance().describeProtocols('sub');
        expect(render).toHaveBeenCalledWith({publishers: expect.anything(), subscriptions: {sub: expect.anything()}}, expect.anything());
    });

    it('should use tolerance to describe protocol', () => {
        ProtocolManager.getInstance().insertSubscription(new Protocol('1234567890.1234567890.1'));
        ProtocolManager.getInstance().describeProtocols('1234567890.1234567890.2');
        expect(render).toHaveBeenCalledWith({publishers: expect.anything(), subscriptions: {'1234567890.1234567890.1': expect.anything()}}, expect.anything());
    });


});
