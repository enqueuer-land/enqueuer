import {Container, Injectable} from "conditional-injector";
import {StartEventPublisherReporter} from "./start-event-publisher-reporter";
import {OnInitEventExecutor} from "../../events/on-init-event-executor";
import {OnFinishEventExecutor} from "../../events/on-finish-event-executor";
import {OnMessageReceivedEventExecutor} from "../../events/on-message-received-event-executor";

let publishMock = jest.fn(() => Promise.resolve(true));
let publisherMock = jest.fn(() => {
    return {
        publish: publishMock
    }
});
let containerMock = jest.fn(() => {
    return {
        create: publisherMock
    }
});

const startEventArgument = {
    publisher: {
        name: 'pubName'
    }
};
jest.mock('conditional-injector');
Container.subclassesOf.mockImplementation(containerMock);



let onInitTrigger = jest.fn(() => []);
let onInitEventMock = jest.fn(() => {
    return {
        trigger: onInitTrigger
    }
});
jest.mock('../../events/on-init-event-executor');
OnInitEventExecutor.mockImplementation((onInitEventMock));


let onFinishTrigger = jest.fn(() => []);
let onFinishEventMock = jest.fn(() => {
    return {
        trigger: onFinishTrigger
    }
});
jest.mock('../../events/on-finish-event-executor');
OnFinishEventExecutor.mockImplementation((onFinishEventMock));


let onMessageReceivedTrigger = jest.fn(() => []);
let onMessageReceivedEventMock = jest.fn(() => {
    return {
        trigger: onMessageReceivedTrigger
    }
});
jest.mock('../../events/on-message-received-event-executor');
OnMessageReceivedEventExecutor.mockImplementation((onMessageReceivedEventMock));

jest.mock('conditional-injector');

describe('StartEventPublisherReporter', () => {
    beforeEach(() => {
        publishMock = jest.fn(() => Promise.resolve(true));
    });

    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toHaveBeenCalledWith({predicate: expect.any(Function)});
    });

    it('Should call publisher constructor', () => {
        new StartEventPublisherReporter(startEventArgument);

        expect(publisherMock).toHaveBeenCalledWith(startEventArgument.publisher);
    });

    it('Should execute onInit', () => {
        new StartEventPublisherReporter(startEventArgument);

        expect(onInitEventMock).toHaveBeenCalledWith('publisher', startEventArgument.publisher);
        expect(onInitTrigger).toHaveBeenCalled();
    });

    it('Should resolve onMessageReceived', done => {
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().then(() => {
            done();
        });

    });


    it('Should reject onMessageReceived', done => {
        const reason = 'reasonMessage';
        publishMock = jest.fn(() => Promise.reject(reason));
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().catch((err) => {
            expect(err).toBe(reason);

            done();
        });

    });

    it('Should add Publisher test - success', done => {
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().then(() => {
            const report = publisherReporter.getReport().publisher;
            expect(report.name).toBe(startEventArgument.publisher.name);
            const publisherTest = report.tests[0];
            expect(publisherTest.name).toBe('Published');
            expect(publisherTest.valid).toBeTruthy();

            done();
        });

    });

    it('Should add Publisher test - fail', done => {
        const reason = 'reasonMessage';
        publishMock = jest.fn(() => Promise.reject(reason));
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().catch(() => {
            const report = publisherReporter.getReport().publisher;
            expect(report.name).toBe(startEventArgument.publisher.name);
            const publisherTest = report.tests[0];
            expect(publisherTest.name).toBe('Published');
            expect(publisherTest.valid).toBeFalsy();

            done();
        });

    });


    it('Should execute onMessageReceived', done => {
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().then(() => {

            expect(onMessageReceivedEventMock).toHaveBeenCalledWith('publisher', publisherMock());
            expect(onMessageReceivedTrigger).toHaveBeenCalled();

            done();
        });

    });

    it('Should add onMessageReceived tests - no message', done => {
        publisherMock = jest.fn(() => {
            return {
                publish: publishMock,
                onMessageReceived: {
                    assertions: 'blah'
                }
            }
        });
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().then(() => {

            const report = publisherReporter.getReport().publisher;
            expect(report.name).toBe(startEventArgument.publisher.name);
            const responseMessageTest = report.tests[1];
            expect(responseMessageTest.name).toBe('Response message received');
            expect(responseMessageTest.valid).toBeFalsy();

            done();
        });

    });

    it('Should add onMessageReceived tests - message', done => {
        publisherMock = jest.fn(() => {
            return {
                publish: publishMock,
                messageReceived: 'hey',
                onMessageReceived: {
                    assertions: 'blah'
                }
            }
        });
        const publisherReporter = new StartEventPublisherReporter(startEventArgument);
        publisherReporter.start().then(() => {

            const report = publisherReporter.getReport().publisher;
            expect(report.name).toBe(startEventArgument.publisher.name);
            const responseMessageTest = report.tests[1];
            expect(responseMessageTest.name).toBe('Response message received');
            expect(responseMessageTest.valid).toBeTruthy();

            done();
        });

    });

    it('Should execute onFinish', () => {
        new StartEventPublisherReporter(startEventArgument).onFinish();

        expect(onFinishEventMock).toHaveBeenCalledWith('publisher', publisherMock());
        expect(onFinishTrigger).toHaveBeenCalled();
    });

});