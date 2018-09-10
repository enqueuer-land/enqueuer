import {Injectable} from "conditional-injector";
import {MultiPublisher} from "../publishers/multi-publisher";
import {DaemonRunExecutor} from "./daemon-run-executor";
import {DaemonInput} from "./daemon-input";
import {MultiRequisitionRunner} from "../runners/multi-requisition-runner";

jest.mock("../runners/multi-requisition-runner");
jest.mock('conditional-injector');
jest.mock('../publishers/multi-publisher');
jest.mock('./daemon-input');

let daemonConfiguration;
describe('DaemonRunExecutor', () => {
    beforeEach(() => {
        daemonConfiguration = {
            runMode: {
                daemon: ['input1', 'input2']
            },
            outputs: 'bla'
        };

    });

    it('should inject properly', () => {
        Injectable.mockImplementation();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate(daemonConfiguration)).toBeTruthy();
        delete daemonConfiguration.runMode.daemon;
        expect(injectableOption.predicate(daemonConfiguration)).toBeFalsy();
    });

    it('should call multipublisher constructor', () => {
        const multiPublisherMock = jest.fn();
        MultiPublisher.mockImplementation(multiPublisherMock);

        new DaemonRunExecutor(daemonConfiguration);

        expect(multiPublisherMock).toBeCalledWith(daemonConfiguration.outputs);
    });

    it('should call DaemonInput constructor', () => {
        let daemonInputMock = jest.fn();
        DaemonInput.mockImplementation(daemonInputMock);

        new DaemonRunExecutor(daemonConfiguration);
        expect(daemonInputMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
        expect(daemonInputMock).toBeCalledWith(daemonConfiguration.runMode.daemon[0]);
        expect(daemonInputMock).toBeCalledWith(daemonConfiguration.runMode.daemon[1]);
    });

    it('execute subscription fail', ()=> {
        expect.assertions(3);
        let unsubscribeMock = jest.fn(() => {
            expect(unsubscribeMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
        });
        let subscribeMock = jest.fn()
            .mockImplementation(() => Promise.reject('reason'));
        DaemonInput.mockImplementation(() =>
        {
            return {
                unsubscribe: unsubscribeMock,
                subscribe: subscribeMock
            }
        });

        new DaemonRunExecutor(daemonConfiguration).execute();
        expect(subscribeMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
    });

    it('receiveMessage - fail', done => {
        expect.assertions(2);
        DaemonInput.mockImplementation(() =>
        {
            return {
                subscribe: () => Promise.resolve(),
                receiveMessage: () => Promise.reject('reason')
            }
        });

        let calls = 0;
        const publishMock = jest.fn(() => {
            ++calls;
            if (calls >= daemonConfiguration.runMode.daemon.length) {
                expect(publishMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
                expect(publishMock).toHaveBeenCalledWith('reason');
                done();
            }
            return new Promise(() => {});
        });
        MultiPublisher.mockImplementation(() => {
            return {
                publish: publishMock
            }
        });

        new DaemonRunExecutor(daemonConfiguration).execute();
    });


    it('run - fail', done => {
        expect.assertions(5);
        DaemonInput.mockImplementation(() =>
        {
            return {
                getType: () => 'type',
                subscribe: () => Promise.resolve(),
                receiveMessage: () => {
                    return new Promise(resolve => resolve(['requisition']));
                }
            }
        });

        const runMock = jest.fn(() => Promise.reject('runMock rejected'));
        let multiRequisitionRunnerMock = jest.fn(() => {
            return {
                run: runMock
            }
        });
        MultiRequisitionRunner.mockImplementation(multiRequisitionRunnerMock);

        let calls = 0;
        const publishMock = jest.fn(() => {
            ++calls;
            if (calls >= daemonConfiguration.runMode.daemon.length) {
                expect(publishMock).toHaveBeenCalledTimes(daemonConfiguration.runMode.daemon.length);
                expect(publishMock).toHaveBeenCalledWith('runMock rejected');

                expect(multiRequisitionRunnerMock).toHaveBeenCalledTimes(2);
                expect(multiRequisitionRunnerMock).toHaveBeenCalledWith(['requisition'], 'type');
                expect(runMock).toHaveBeenCalledTimes(2);

                done();
            }
            return new Promise(() => {});
        });
        MultiPublisher.mockImplementation(() => {
            return {
                publish: publishMock
            }
        });


        new DaemonRunExecutor(daemonConfiguration).execute();
    });

});