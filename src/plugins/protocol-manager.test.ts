import {ProtocolManager} from "./protocol-manager";
import prettyjson from "prettyjson";
import {NullPublisher} from "../publishers/null-publisher";
import {NullSubscription} from "../subscriptions/null-subscription";
import {SubscriptionProtocol} from "../protocols/subscription-protocol";
import {PublisherProtocol} from "../protocols/publisher-protocol";

jest.mock('prettyjson');

const render = jest.fn();
prettyjson.render.mockImplementation(render);

describe('ProtocolManager', () => {

    beforeEach(() => {
        render.mockClear();
    });

    it('describeProtocols', () => {
        new ProtocolManager().describeProtocols();
        expect(render).toHaveBeenCalledWith({
            publishers: expect.anything(),
            subscriptions: expect.anything()
        }, expect.anything());
    });

    it('should create right Publisher', () => {
        const publisher: any = {};
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        protocolManager.addProtocol(new PublisherProtocol('mine', (arg) => {
            publisher.arg = arg;
            return publisher;
        }));
        const actual = protocolManager.createPublisher({type: 'mine'});
        expect(actual).toEqual(  {arg: {type: "mine"}});
    });

    it('should create right Subscription', () => {
        const subscription: any = {};
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        protocolManager.addProtocol(new SubscriptionProtocol('mine', (arg) => {
            subscription.arg = arg;
            return subscription;
        }, []));
        const actual = protocolManager.createSubscription({type: 'mine'});
        expect(actual).toEqual(  {arg: {type: "mine"}});
    });

    it('should create NullPublisher', () => {
        const publisher = new ProtocolManager().createPublisher({});
        expect(publisher).toBeInstanceOf(NullPublisher);
    });

    it('should create NullSubscription', () => {
        const publisher = new ProtocolManager().createSubscription({});
        expect(publisher).toBeInstanceOf(NullSubscription);
    });

    it('describe given publisher Protocol', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        protocolManager.addProtocol(new PublisherProtocol('pub',
            () => {}).addAlternativeName('virgs').setLibrary('request'));
        protocolManager.describeProtocols();
        expect(render).toHaveBeenCalled();
    });

    it('describe given subscription Protocol', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        protocolManager.addProtocol(new SubscriptionProtocol('sub',
            () => {}, ['value']).addAlternativeName('altName')
            .setLibrary('express'));
        protocolManager.describeProtocols();
        expect(render).toHaveBeenCalled();
    });

});
