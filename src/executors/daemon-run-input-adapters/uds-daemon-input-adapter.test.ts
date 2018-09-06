import {UdsDaemonInputAdapter} from "./uds-daemon-input-adapter";
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');

describe('UdsDaemonInputAdapter', () => {

    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toBeCalled();
    });

    it('should return undefined', () => {
        expect(new UdsDaemonInputAdapter().adapt({unknown: ''})).toBeUndefined();
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