import {HandlerListener} from "./handler-listener";
import {HandlerListener} from "./handler-listener";
import {Logger} from "../loggers/logger";

let onErrorMock = jest.fn();
let listenMock = jest.fn();
let closeMock = jest.fn();

const warningMock = jest.fn();
const traceMock = jest.fn();
const debugMock = jest.fn();
const errorMock = jest.fn();
jest.mock("../loggers/logger");
Logger.warning.mockImplementation(warningMock);
Logger.trace.mockImplementation(traceMock);
Logger.debug.mockImplementation(debugMock);
Logger.error.mockImplementation(errorMock);

// global.setTimeout.mockImplementation(cb => cb());
jest.useFakeTimers();

const createServerMock = () => {
    return {
        on: onErrorMock,
        listen: listenMock,
        close: closeMock,
    };
};

describe('HandleListener', () => {

    beforeEach(() => {
        onErrorMock = jest.fn();
        listenMock.mockClear();
        closeMock.mockClear();
        errorMock.mockClear();
        warningMock.mockClear();
        setTimeout.mockClear();
    });

    it('Happy path', done => {
        const handler = 987;

        listenMock = jest.fn((argHandler, cb) => {
            expect(argHandler).toBe(handler);
            return cb()
        });

        const listener = new HandlerListener(createServerMock());
        listener.listen(handler)
            .then(() => {
                expect(listenMock).toHaveBeenCalledTimes(1);
                expect(listenMock).toHaveBeenCalledWith(handler, expect.any(Function));
                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledTimes(0);
                done();
            });
    });

    it('Should bind to "error" event', done => {
        const handler = 987;

        onErrorMock = jest.fn((eventName, cb) => {
            expect(eventName).toBe('error');
            return cb('error');
        });

        const listener = new HandlerListener(createServerMock());
        listener.listen(handler)
            .catch((err) => {
                expect(err).toBe('Error listening to handler (987) "error"');
                expect(listenMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledTimes(0);
                expect(warningMock).toHaveBeenCalledTimes(1);
                done();
            });

    });

    it('Should catch listen exception', done => {
        const handler = 987;
        const exception = 'exception';

        listenMock = jest.fn((argHandler, cb) => {
            throw exception;
        });

        const listener = new HandlerListener(createServerMock());
        listener.listen(handler)
            .catch((err) => {
                expect(err).toBe(`Error listening to handler (${handler}) "${exception}"`);
                expect(listenMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledTimes(0);
                expect(warningMock).toHaveBeenCalledTimes(1);
                done();
            });

    });

    it('Retry just once when it\'s not EADDRINUSE', done => {
        const handler = 987;
        jest.runAllTimers();

        listenMock.mockImplementationOnce((argHandler, cb) => cb({
            code: 'It\'s not EADDRINUSE'
        }));

        const listener = new HandlerListener(createServerMock());

        listener.listen(handler)
            .catch((err) => {
                expect(err).toBe('Error listening to handler (987) {\n' +
                    '  "code": "It\'s not EADDRINUSE"\n' +
                    '}');
                expect(listenMock).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledTimes(0);
                expect(errorMock).toHaveBeenCalledTimes(1);
                done();
            });

    });

    it('Retry after retryInterval if error is EADDRINUSE', done => {
        const handler = 987;
        const numAttempts = 2;
        const retryInterval = 2;

        listenMock.mockImplementationOnce((argHandler, cb) => {
            return cb({
                code: 'EADDRINUSE'
            })
        });
        listenMock.mockImplementationOnce((argHandler, cb) => {
            return cb()
        });

        const listener = new HandlerListener(createServerMock(), numAttempts, retryInterval);

        listener.listen(handler)
            .then(() => {
                expect(listenMock).toHaveBeenCalledTimes(numAttempts);
                expect(closeMock).toHaveBeenCalledTimes(numAttempts - 1);
                expect(setTimeout).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), retryInterval);
                done();
            });

        // Fast-forward until all timers have been executed
        jest.runAllTimers();


    });

    it('Try max attempts num if error is EADDRINUSE', done => {
        const handler = 987;
        const numAttempts = 15;

        for (let i = 0; i < numAttempts - 1; ++i) {
            listenMock.mockImplementationOnce((argHandler, cb) => cb({
                code: 'EADDRINUSE'
            }));
        }
        listenMock.mockImplementationOnce((argHandler, cb) => {
            return cb()
        });

        const listener = new HandlerListener(createServerMock(), numAttempts);

        listener.listen(handler)
            .then(() => {
                expect(listenMock).toHaveBeenCalledTimes(numAttempts);
                expect(closeMock).toHaveBeenCalledTimes(numAttempts - 1);
                expect(setTimeout).toHaveBeenCalledTimes(numAttempts - 1);
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
                done();
            });

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

    });

    it('Should fail it try max attempts is over when error is EADDRINUSE', done => {
        const handler = 'virgs';
        const numAttempts = 15;

        for (let i = 0; i < numAttempts; ++i) {
            listenMock.mockImplementationOnce((argHandler, cb) => cb({
                code: 'EADDRINUSE'
            }));
        }

        const listener = new HandlerListener(createServerMock(), numAttempts);

        listener.listen(handler)
            .catch((err) => {
                expect(err).toBe(`Could not bind to handler ${handler}`);
                expect(listenMock).toHaveBeenCalledTimes(numAttempts);
                expect(closeMock).toHaveBeenCalledTimes(numAttempts);
                expect(setTimeout).toHaveBeenCalledTimes(numAttempts);
                expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 300);
                done();
            });

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

    });

});