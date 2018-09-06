import {UdsDaemonInputAdapter} from "./uds-daemon-input-adapter";
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');


describe('UdsDaemonInputAdapter', () => {

    it('should inject properly', () => {
        Injectable.mockImplementation();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate('uds')).toBeTruthy();
    });

    it('should throw exception', () => {
        expect(() => new UdsDaemonInputAdapter().adapt({unknown: ''})).toThrow('Uds daemon input can not adapt received message');
    });

    it('should parse string payload', () => {
        const message = 'value';
        expect(new UdsDaemonInputAdapter().adapt({payload: message})).toBe(message);
    });

    it('should parse buffer payload', () => {
        const message = 'value';
        expect(new UdsDaemonInputAdapter().adapt({payload: Buffer.from(message)})).toBe(message);
    });

    it('should parse string message', () => {
        const message = 'value';
        expect(new UdsDaemonInputAdapter().adapt(message)).toBe(message);
    });

    it('should parse buffer message', () => {
        const message = 'value';
        expect(new UdsDaemonInputAdapter().adapt(Buffer.from(message))).toBe(message);
    });
});