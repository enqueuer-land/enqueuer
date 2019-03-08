import {ProtocolManager} from './protocol-manager';
import prettyjson from 'prettyjson';
import {NullPublisher} from '../publishers/null-publisher';
import {NullSubscription} from '../subscriptions/null-subscription';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';
import {PublisherProtocol} from '../protocols/publisher-protocol';

jest.mock('prettyjson');

const render = jest.fn();
// @ts-ignore
prettyjson.render.mockImplementation(render);

describe('ProtocolManager', () => {

    beforeEach(() => {
        render.mockClear();
    });

    it('describeProtocols', () => {
        const protocolManager = new ProtocolManager();
        // @ts-ignore
        protocolManager.addProtocol(new PublisherProtocol('mine', () => {));
        expect(protocolManager.describeProtocols(true)).toBeTruthy();
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
        // @ts-ignore
        const actual = protocolManager.createPublisher({type: 'mine'});
        expect(actual).toEqual({arg: {type: 'mine'}});
    });

    it('should create right Subscription', () => {
        const subscription: any = {};
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        protocolManager.addProtocol(new SubscriptionProtocol('mine', (arg) => {
            subscription.arg = arg;
            return subscription;
        }, []));
        // @ts-ignore
        const actual = protocolManager.createSubscription({type: 'mine'});
        expect(actual).toEqual({arg: {type: 'mine'}});
    });

    it('should create NullPublisher', () => {
        // @ts-ignore
        const publisher = new ProtocolManager().createPublisher({});
        expect(publisher).toBeInstanceOf(NullPublisher);
    });

    it('should create NullSubscription', () => {
        // @ts-ignore
        const publisher = new ProtocolManager().createSubscription({});
        expect(publisher).toBeInstanceOf(NullSubscription);
    });

    it('describe given publisher Protocol', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        // @ts-ignore
        protocolManager.addProtocol(new PublisherProtocol('pub', () => {/*not empty*/
        })
            .addAlternativeName('virgs')
            .setLibrary('request'));
        expect(protocolManager.describeProtocols('virgs')).toBeTruthy();
        expect(render).toHaveBeenCalledWith({
                'publishers': [{
                    'alternativeNames': ['virgs'],
                    'library': {'installed': true, 'name': 'request'},
                    'messageReceivedParams': [],
                    'name': 'pub'
                }], 'subscriptions': []
            }, expect.anything()
        );
    });

    it('describe given publisher Protocol not string param', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        // @ts-ignore
        protocolManager.addProtocol(new PublisherProtocol('pub', () => {/*not empty*/
        }));
        // @ts-ignore
        protocolManager.addProtocol(new PublisherProtocol('other', () => {/*not empty*/
        }));
        expect(protocolManager.describeProtocols(true)).toBeTruthy();
        expect(render).toHaveBeenCalledWith({
                'publishers': [{'messageReceivedParams': [], 'name': 'pub'}, {
                    'messageReceivedParams': [],
                    'name': 'other'
                }], 'subscriptions': []
            }, expect.anything()
        );
    });

    it('error describe given publisher Protocol', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        expect(protocolManager.describeProtocols(true)).toBeFalsy();
        expect(render).toHaveBeenCalled();
    });

    it('describe given subscription Protocol', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        // @ts-ignore
        protocolManager.addProtocol(new SubscriptionProtocol('sub', () => {/*not empty*/
        }, ['value']).addAlternativeName('altName')
            .setLibrary('express'));
        expect(protocolManager.describeProtocols('sub')).toBeTruthy();
        expect(render).toHaveBeenCalledWith({
            'publishers': [],
            'subscriptions': [{
                'alternativeNames': ['altName'],
                'library': {'installed': true, 'name': 'express'},
                'messageReceivedParams': ['value'],
                'name': 'sub'
            }]
        }, expect.anything());
    });

    it('describe given subscription Protocol not string param', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        // @ts-ignore
        protocolManager.addProtocol(new SubscriptionProtocol('sub', () => { /*not empty*/
        }));
        // @ts-ignore
        protocolManager.addProtocol(new SubscriptionProtocol('sub2', () => { /*not empty*/
        }));
        expect(protocolManager.describeProtocols(true)).toBeTruthy();
        expect(render).toHaveBeenCalledWith({
            'publishers': [],
            'subscriptions': [{'messageReceivedParams': undefined, 'name': 'sub'}, {'messageReceivedParams': undefined, 'name': 'sub2'}]
        }, expect.anything());
    });

    it('error describe given subscription Protocol', () => {
        // @ts-ignore
        const protocolManager = new ProtocolManager();
        expect(protocolManager.describeProtocols('value')).toBeFalsy();
        expect(render).toHaveBeenCalled();
    });

});
