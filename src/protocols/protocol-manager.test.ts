import {ProtocolManager} from "./protocol-manager";
import prettyjson from "prettyjson";
import {PublisherProtocol} from "./publisher-protocol";
import {SubscriptionProtocol} from "./subscription-protocol";
import {NullPublisher} from "../publishers/null-publisher";
import {NullSubscription} from "../subscriptions/null-subscription";

jest.mock('prettyjson');

const render = jest.fn();
prettyjson.render.mockImplementation(render);

describe('ProtocolManager', () => {

    beforeEach(() => {
        // @ts-ignore
        ProtocolManager.instance = null;
        render.mockClear();
    });

    it('describeProtocols', () => {
        new ProtocolManager().init().describeProtocols();
        expect(render).toHaveBeenCalledWith({
            publishers: expect.anything(),
            subscriptions: expect.anything()
        }, expect.anything());
    });

    it('should create right Publisher', () => {
        const publisher: any = {};
        // @ts-ignore
        new ProtocolManager().init().addProtocol(new PublisherProtocol('mine', (arg) => {
            publisher.arg = arg;
            return publisher;
        }));
        const actual = new ProtocolManager().init().createPublisher({type: 'mine'});
        expect(actual).toEqual(  {name: undefined, payload: undefined, type: "mine", ignore: false});
    });

    it('should create right Subscription', () => {
        const subscription: any = {};
        // @ts-ignore
        new ProtocolManager().init().addProtocol(new SubscriptionProtocol('mine', (arg) => {
            subscription.arg = arg;
            return subscription;
        }));
        const actual = new ProtocolManager().init().createSubscription({type: 'mine'});
        expect(actual).toEqual({name: undefined, avoid: false, type: "mine", ignore: false});
    });

    it('should create NullPublisher', () => {
        const publisher = new ProtocolManager().init().createPublisher({});
        expect(publisher).toBeInstanceOf(NullPublisher);
    });

    it('should create NullSubscription', () => {
        const publisher = new ProtocolManager().init().createSubscription({});
        expect(publisher).toBeInstanceOf(NullSubscription);
    });

    it('describe given publisher Protocol', () => {
        // @ts-ignore
        new ProtocolManager().addProtocol(new PublisherProtocol('pub',
            () => {
            }, {key: 'value'}).addAlternativeName('virgs').setLibrary('request'));
        new ProtocolManager().init().describeProtocols();
        expect(render).toHaveBeenCalled();
    });

    it('describe given subscription Protocol', () => {
        // @ts-ignore
        new ProtocolManager().addProtocol(new SubscriptionProtocol('sub',
            () => {
            }, {key: 'value'}).addAlternativeName('altName')
            .setLibrary('express'));
        new ProtocolManager().init().describeProtocols();
        expect(render).toHaveBeenCalled();
    });

});
