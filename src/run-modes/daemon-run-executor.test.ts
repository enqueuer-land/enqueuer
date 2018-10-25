import {Container, Injectable} from "conditional-injector";
import {MultiTestsOutput} from "../outputs/multi-tests-output"
import {DaemonRunExecutor} from "./daemon-run-executor";

jest.mock("../requisition-runners/multi-requisition-runner");
jest.mock('../outputs/multi-tests-output');
jest.mock('./daemon-run-input/daemon-input');

let subscribeMock = jest.fn(() => Promise.resolve(true));
let createMock = jest.fn(() => {
    return {
        subscribe: subscribeMock
    }
});
let containerMock = jest.fn(() => {
    return {
        create: createMock
    }
});

jest.mock('conditional-injector');
Container.subclassesOf.mockImplementation(containerMock);


let daemonConfiguration;
describe('DaemonRunExecutor', () => {
    beforeEach(() => {
        daemonConfiguration = {
            daemon: ['input1', 'input2'],
            outputs: 'bla'
        };
        createMock.mockReset();

    });

    it('should inject properly', () => {
        Injectable.mockImplementation();
        const mockCalls = Injectable.mock.calls;
        const injectableOption = mockCalls[mockCalls.length - 1][0];
        expect(injectableOption.predicate(daemonConfiguration)).toBeTruthy();
        delete daemonConfiguration.daemon;
        expect(injectableOption.predicate(daemonConfiguration)).toBeFalsy();
    });

    it('should call multipublisher constructor', () => {
        const multiMock = jest.fn();
        MultiTestsOutput.mockImplementation(multiMock);

        new DaemonRunExecutor(daemonConfiguration);

        expect(multiMock).toBeCalledWith(daemonConfiguration.outputs);
    });

    it('should call DaemonInput constructor', () => {

        new DaemonRunExecutor(daemonConfiguration);
        expect(createMock).toHaveBeenCalledTimes(daemonConfiguration.daemon.length);
        expect(createMock).toBeCalledWith(daemonConfiguration.daemon[0]);
        expect(createMock).toBeCalledWith(daemonConfiguration.daemon[1]);
    });
    //
    // it('print subscription fail', ()=> {
    //     expect.assertions(3);
    //     let unsubscribeMock = jest.fn(() => {
    //         expect(unsubscribeMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
    //     });
    //     let subscribeMock = jest.fn()
    //         .mockImplementation(() => Promise.reject('reason'));
    //     createMock.mockImplementation(() =>
    //     {
    //         return {
    //             unsubscribe: unsubscribeMock,
    //             subscribe: subscribeMock
    //         }
    //     });
    //
    //     new DaemonRunExecutor(daemonConfiguration).print();
    //     expect(subscribeMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
    // });
    //
    // it('run - fail', done => {
    //     expect.assertions(3);
    //     createMock.mockImplementation(() =>
    //     {
    //         return {
    //             sendResponse: () => Promise.resolve(),
    //             subscribe: () => Promise.resolve(),
    //             receiveMessage: () => {
    //                 return new Promise(resolve => resolve(['requisition']));
    //             }
    //         }
    //     });
    //
    //     const runMock = jest.fn(() => Promise.reject('runMock rejected'));
    //     let multiRequisitionRunnerMock = jest.fn(() => {
    //         return {
    //             run: runMock
    //         }
    //     });
    //     MultiRequisitionRunner.mockImplementation(multiRequisitionRunnerMock);
    //
    //     let calls = 0;
    //     const publishMock = jest.fn(() => {
    //         ++calls;
    //         if (calls >= daemonConfiguration.runMode.daemon.length) {
    //             expect(publishMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
    //             expect(publishMock).toHaveBeenCalledWith('runMock rejected');
    //             expect(runMock).toHaveBeenCalledTimes(2);
    //
    //             done();
    //         }
    //         return new Promise(() => {});
    //     });
    //     MultiPublisher.mockImplementation(() => {
    //         return {
    //             publish: publishMock
    //         }
    //     });
    //
    //
    //     new DaemonRunExecutor(daemonConfiguration).print();
    // });

});
