import {StartEventSubscriptionReporter} from './start-event-subscription-reporter';
import {SubscriptionReporter} from "../subscription/subscription-reporter";

let startTimeoutMock = cb => {};
let subscribeMock = jest.fn(() => new Promise());
let receiveMessageMock = jest.fn(() => new Promise());
let getReportMock;
let SubscriptionReporterMock = jest.fn(() => {
    return {
        startTimeout: startTimeoutMock,
        subscribe: subscribeMock,
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

describe('StartEventSubscriptionReporter', () => {
    beforeEach(() => {
        startTimeoutMock = cb => {};
        subscribeMock = jest.fn(() => new Promise());
        receiveMessageMock = jest.fn(() => new Promise());
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

    it('Sub throws timeout', done => {
        startTimeoutMock = cb => cb();

        const startEvent: StartEventSubscriptionReporter = new StartEventSubscriptionReporter(startEventArgument);

        startEvent.start().then(() => done());
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