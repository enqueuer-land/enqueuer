import {Injectable} from "conditional-injector";
import {HttpContainerPool} from "../../pools/http-container-pool";
import {HttpDaemonInput} from "./http-daemon-input";
jest.mock('conditional-injector');
Injectable.mockImplementation();

let methodVerbMock = jest.fn((endpoint, cb) => {
    cb({
        rawBody: 'virgs'
    });
});
let httpContainerGetAppMock = jest.fn(async () => {
    return {
        methodVerb: methodVerbMock,
        post: methodVerbMock,
    }
});
const httpContainerReleaseAppMock = jest.fn();


jest.mock('../../pools/http-container-pool');
HttpContainerPool.getApp.mockImplementation(httpContainerGetAppMock);
HttpContainerPool.releaseApp.mockImplementation(httpContainerReleaseAppMock);

describe('HttpDaemonInput', () => {
    let daemonInput;

    beforeEach(() => {
        HttpContainerPool.getApp.mockImplementation(httpContainerGetAppMock);
        HttpContainerPool.releaseApp.mockImplementation(httpContainerReleaseAppMock);
        daemonInput = {
            type: 'http',
            port: 'blabla',
            method: 'methodVerb',
            endpoint: '/endpoint',
        };
    });

    it('should inject correctly', () => {
        const mockCalls = Injectable.mock.calls;
        const injectableOption = mockCalls[mockCalls.length - 1][0];
        expect(injectableOption.predicate(daemonInput)).toBeTruthy();
        delete daemonInput.type;
        expect(injectableOption.predicate(daemonInput)).toBeFalsy();
        Injectable.mockClear();
    });

    it('should subscribe httpContainer', done => {
        const onMessageReceived = jest.fn();
        new HttpDaemonInput(daemonInput).subscribe(onMessageReceived).then(() => {
            expect(httpContainerGetAppMock).toHaveBeenCalledWith(daemonInput.port);
            expect(methodVerbMock).toHaveBeenCalledWith(daemonInput.endpoint, expect.any(Function));
            const requisition = {
                daemon: daemonInput,
                input: "virgs",
                responseHandler: undefined,
                type: daemonInput.type
            };
            expect(onMessageReceived).toHaveBeenCalledWith(requisition);
            done();

        });
    });

    it('should subscribe httpContainer error', () => {
        HttpContainerPool.getApp.mockImplementation(() => Promise.reject('any reason'));
        expect(new HttpDaemonInput(daemonInput).subscribe()).rejects.toBe("Error in HttpDaemonInput subscription: any reason");
    });

    it('should subscribe default values httpContainer', done => {
        const requisition = {
            daemon: {
                endpoint: "/requisitions",
                method: "post",
                port: 23023,
                type: undefined
            },
            input: "virgs",
            responseHandler: undefined,
            type: undefined
        };
        const onMessageReceived = jest.fn();
        new HttpDaemonInput({}).subscribe(onMessageReceived).then(() => {
            expect(httpContainerGetAppMock).toHaveBeenCalledWith(requisition.daemon.port);
            expect(methodVerbMock).toHaveBeenCalledWith(requisition.daemon.endpoint, expect.any(Function));

            expect(onMessageReceived).toHaveBeenCalledWith(requisition);
            done();

        });
    });

    it('should unsubscribe httpContainer', () => {
        new HttpDaemonInput(daemonInput).unsubscribe();
        expect(httpContainerReleaseAppMock).toHaveBeenCalledWith(daemonInput.port);
    });

    it('should clean httpContainer', () => {
        expect(new HttpDaemonInput(daemonInput).cleanUp({})).resolves.toBeUndefined();
    });

    it('should sendResponse httpContainer', done => {
        const send = jest.fn();
        const value = {
            output: 'output',
            responseHandler: {
                status: jest.fn(() => {
                    return {
                        send: send
                    }
                })
            }
        };
        new HttpDaemonInput(daemonInput).sendResponse(value).then(() => {
            expect(value.responseHandler.status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith(value.output);
            done();
        });
    });

    it('should catch sendResponse httpContainer', done => {
        const send = jest.fn(() => {
            throw 'error'
        });
        const value = {
            output: 'output',
            responseHandler: {
                status: jest.fn(() => {
                    return {
                        send: send
                    }
                })
            }
        };
        new HttpDaemonInput(daemonInput).sendResponse(value).catch(() => {
            expect(value.responseHandler.status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith(value.output);
            done();
        });
    });


});
