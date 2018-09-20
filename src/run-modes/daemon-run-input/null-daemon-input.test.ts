import {Logger} from "../../loggers/logger";
import {Injectable} from "conditional-injector";
import {NullDaemonInput} from "./null-daemon-input";

jest.mock('../../loggers/logger');
const warningMock = jest.fn();
Logger.warning.mockImplementation(warningMock);

jest.mock('conditional-injector');
Injectable.mockImplementation();

describe('NullDaemonInput', () => {

    it('should be the null object implementation', () => {
        expect(Injectable).toBeCalledWith();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
    });

    it('should reject to "subscribe"', () => {
        const model = {type: 'unknown'};
        expect(new NullDaemonInput(model).subscribe('any')).rejects.toBeDefined();
    });

    it('should reject to "sendResponse"', () => {
        const model = {type: 'unknown'};
        expect(new NullDaemonInput(model).sendResponse('any')).resolves.toBeUndefined();
    });

    it('should reject to "cleanUp"', () => {
        const model = {type: 'unknown'};
        expect(new NullDaemonInput(model).cleanUp('any')).rejects.toBeDefined();
    });

    it('should reject to "receiveMessage"', () => {
        const model = {type: 'unknown'};
        expect(new NullDaemonInput(model).receiveMessage()).rejects.toBeDefined();
    });

    it('should reject to "unsubscribe"', () => {
        const model = {type: 'unknown'};
        expect(new NullDaemonInput(model).unsubscribe('any')).rejects.toBeDefined();
    });
});