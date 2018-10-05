import {ProtocolsManager} from "./protocols-manager";

describe('ProtocolsManager', () => {

    it('listAvailable', () => {
        const available = new ProtocolsManager().listAvailable();
        expect(available).toEqual(["amqp", "file", "http", "kafka", "mqtt", "sqs", "stdin", "stdout", "stomp", "tcp", "udp", "uds", "zeromq"]);
    });

    it('find protocol from name', () => {
        const available = new ProtocolsManager().findProtocolFromName('file', ProtocolsManager.publishersGroup);
        expect(available).toBeDefined();
    });

    it('find protocol from alternative name', () => {
        const available = new ProtocolsManager().findProtocolFromName('standard-input', ProtocolsManager.subscriptionsGroup);
        expect(available).toBeDefined();
    });

    it('undefined protocol from name', () => {
        const available = new ProtocolsManager().findProtocolFromName('undefined', ProtocolsManager.publishersGroup);
        expect(available).toBeUndefined();
    });

    it('find protocol with library from name', () => {
        const library = new ProtocolsManager().findLibraryFromName('amqp', ProtocolsManager.publishersGroup);
        expect(library).toBeDefined();
        if (library) {
            expect(library.name).toBe('amqp');
            expect(library.version).toBeDefined();
        }
    });

    it('find protocol with library from alternative name', () => {
        const library = new ProtocolsManager().findLibraryFromName('sqs', ProtocolsManager.publishersGroup);
        expect(library).toBeDefined();
        if (library) {
            expect(library.name).toBe('aws-sdk');
            expect(library.version).toBeDefined();
        }
    });

    it('get library from name', () => {
        const available = ProtocolsManager.getDependency('mqtt');
        expect(available).toBeDefined();
    });

    it('get undefined library from name', () => {
        const available = ProtocolsManager.getDependency('not-defined-at-least-I-hope');
        expect(available).toBeUndefined();
    });

    it('suggest subscription based on (dependency)', () => {
        const available = new ProtocolsManager().suggestSubscriptionBasedOn('https-proxy');
        expect(available).toBeGreaterThan(0)
    });

    it('suggest subscription based on (optionalDependency)', () => {
        const available = new ProtocolsManager().suggestSubscriptionBasedOn('zero');
        expect(available).toBeGreaterThan(0)
    });

    it('suggest publisher based on', () => {
        const available = new ProtocolsManager().suggestPublisherBasedOn('https'); //http-publisher is node native
        expect(available).toBe(0)
    });

    it('isLibraryInstalled', () => {
        // @ts-ignore
        const available = ProtocolsManager.isLibraryInstalled('zeromq');
        expect(available).toBeTruthy();
    });

    it('isLibraryInstalled false', () => {
        // @ts-ignore
        const available = ProtocolsManager.isLibraryInstalled('zero-mq-not-defined-at-least-I-hope');
        expect(available).toBeFalsy();
    });


});