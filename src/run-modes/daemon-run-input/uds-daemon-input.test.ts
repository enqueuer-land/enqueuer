import {Injectable} from "conditional-injector";
import {UdsDaemonInput} from "./uds-daemon-input";
import {StreamInputHandler} from "../../handlers/stream-input-handler";

jest.mock('conditional-injector');
Injectable.mockImplementation();

const unsubscribeMock = jest.fn();
const subscribeMock = jest.fn((cb) => {
    return cb({
        message: 'does not matter',
        stream: 'stream'
    });
});
const closeMock = jest.fn();
const sendResponseMock = jest.fn();
let streamInputMock = jest.fn(() => {
    return {
        unsubscribe: unsubscribeMock,
        subscribe: subscribeMock,
        sendResponse: sendResponseMock,
        close: closeMock
    }
});
jest.mock('../../handlers/stream-input-handler');
StreamInputHandler.mockImplementation(streamInputMock);

let daemonInput;
describe('UdsDaemonInput', () => {

    beforeEach(() => {
        daemonInput = {
            type: 'uds',
            path: 'blabla',
        };
    });


    it('should inject correctly', () => {
        Injectable.mockImplementation();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate(daemonInput)).toBeTruthy();
        delete daemonInput.type;
        expect(injectableOption.predicate(daemonInput)).toBeFalsy();

    });

    it('should instantiate stream input', () => {
        new UdsDaemonInput(daemonInput);

        expect(streamInputMock).toHaveBeenCalledWith(daemonInput.path);
    });

    it('should instantiate stream input with default handler', () => {
        new UdsDaemonInput({});

        expect(streamInputMock).toHaveBeenCalledWith( "/tmp/enqueuer.requisitions");
    });

    it('should subscribe stream input', done => {
        const onMessageReceived = jest.fn();
        new UdsDaemonInput(daemonInput).subscribe(onMessageReceived).then(() => {
            expect(subscribeMock).toHaveBeenCalled();
            expect(onMessageReceived).toHaveBeenCalled();
            done();

        });
    });

    it('should unsubscribe stream input', done => {
        new UdsDaemonInput(daemonInput).unsubscribe().then(() => {
            expect(unsubscribeMock).toHaveBeenCalled();
            done();
        });
    });

    it('should clean stream input', done => {
        const value = {
            stream: 'does not matter'
        };
        new UdsDaemonInput(daemonInput).cleanUp(value).then(() => {
            expect(closeMock).toHaveBeenCalledWith(value.stream);
            done();
        });
    });

    it('should sendResponse stream input', done => {
        const value = {
            stream: 'does not matter',
            output: 'output'
        };
        new UdsDaemonInput(daemonInput).sendResponse(value).then(() => {
            expect(sendResponseMock).toHaveBeenCalledWith(value.stream, value.output);
            done();
        });
    });


});