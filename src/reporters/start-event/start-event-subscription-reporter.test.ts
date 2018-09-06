import {StartEventSubscriptionReporter} from './start-event-subscription-reporter';
import {SubscriptionReporter} from "../subscription/subscription-reporter";
import {Injectable} from "conditional-injector";

let startTimeoutMock = cb => {};
let onFinishMock = jest.fn();
let subscribeMock = jest.fn(() => new Promise());
let receiveMessageMock = jest.fn(() => new Promise());
let getReportMock;
let SubscriptionReporterMock = jest.fn(() => {
    return {
        startTimeout: startTimeoutMock,
        subscribe: subscribeMock,
        onFinish: onFinishMock,
        receiveMessage: receiveMessageMock,
        getReport: getReportMock
    }
});

jest.mock('../subscription/subscription-reporter');
SubscriptionReporter.mockImplementation(SubscriptionReporterMock);

const startEventArgument = {
    subscription: {
        name: 'subName'
    }
};
jest.mock('conditional-injector');

describe('StartEventSubscriptionReporter', () => {
    beforeEach(() => {
        startTimeoutMock = cb => {};
        subscribeMock = jest.fn(() => new Promise());
        receiveMessageMock = jest.fn(() => new Promise());
    });

    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toHaveBeenCalledWith({predicate: expect.any(Function)});
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate({subscription: 'value'})).toBeTruthy();
        expect(injectableOption.predicate({unknown: 'value'})).toBeFalsy();
    });


    it('Should call subReporter constructor', () => {
        new StartEventSubscriptionReporter(startEventArgument);

        expect(SubscriptionReporterMock).toHaveBeenCalledWith(startEventArgument.subscription);
    });

    it('Should add subs default name', () => {
        const startEventArgument = {subscription: {} };
        new StartEventSubscriptionReporter(startEventArgument);

        expect(startEventArgument.subscription.name).toBe('Start event subscription');
    });

    it('Sub throws timeout - not subscribed', () => {
        startTimeoutMock = cb => cb();

        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        expect(startEvent.start()).rejects.toBeUndefined();
    });

    it('Sub throws timeout - subscribed', () => {
        subscribeMock = jest.fn(() => Promise.resolve());
        startTimeoutMock = cb => cb();

        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        expect(startEvent.start()).resolves.toBeUndefined();
    });

    it('Happy path', done => {
        subscribeMock = jest.fn(() => Promise.resolve());
        receiveMessageMock = jest.fn(() => Promise.resolve());
        getReportMock = jest.fn(() =>  {
            return {valid: true, tests: [{valid: false}]};
        });

        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        startEvent.start().then(() => {
            expect(startEvent.getReport().subscription.valid).toBeFalsy();
            done()
        });
    });

    it('On finish', () => {
        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        startEvent.onFinish();

        expect(onFinishMock).toHaveBeenCalled();

    });

    it('Handling subscription failure', () => {
        expect.assertions(1);
        subscribeMock = jest.fn(() => Promise.reject('errDesc'));

        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        expect(startEvent.start()).rejects.toBe('errDesc');
    });

    it('Handling receiveMessage failure', () => {
        expect.assertions(1);
        subscribeMock = jest.fn(() => Promise.resolve());
        receiveMessageMock = jest.fn(() => Promise.reject('errDesc'));

        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        expect(startEvent.start()).rejects.toBe('errDesc');
    });

});