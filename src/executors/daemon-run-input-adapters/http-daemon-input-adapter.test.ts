import {Injectable} from "conditional-injector";
import {HttpDaemonInputAdapter} from "./http-daemon-input-adapter";

jest.mock('conditional-injector');

describe('HttpDaemonInputAdapter', () => {

    it('should inject properly', () => {
        Injectable.mockImplementation();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate('http-server')).toBeTruthy();
    });

    it('should parse string body', () => {
        const message = 'value';
        expect(new HttpDaemonInputAdapter().adapt({body: message})).toBe(message);
    });

    it('should parse buffer body', () => {
        const message = 'value';
        expect(new HttpDaemonInputAdapter().adapt({body: Buffer.from(message)})).toBe(message);
    });

    it('should parse object', () => {
        const message = {
            object: 123
        };
        expect(new HttpDaemonInputAdapter().adapt({body: message})).toBe(JSON.stringify(message));
    });


});