import {ProtocolsManager} from "./protocols-manager";
import '../injectable-files-list'
import "../publishers/zero-mq-pub-publisher";

describe('ProtocolsManager', () => {

    it('listAvailable', () => {
        ProtocolsManager.insertPublisherProtocol('amqp');
        ProtocolsManager.insertSubscriptionProtocol('amqp', ['IEI', 'AMQP']);
        const available = new ProtocolsManager().listAvailable();
        expect(available).toEqual(["amqp"]);
    });



});