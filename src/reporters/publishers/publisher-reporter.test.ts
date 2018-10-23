import {Container} from "conditional-injector";
import {OnInitEventExecutor} from "../../events/on-init-event-executor";
import {OnFinishEventExecutor} from "../../events/on-finish-event-executor";
import {OnMessageReceivedEventExecutor} from "../../events/on-message-received-event-executor";
import {PublisherReporter} from "./publisher-reporter";

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

const publisher = {
    name: 'pubName'
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

describe('PublisherReporter', () => {
    beforeEach(() => {
        publishMock = jest.fn(() => Promise.resolve(true));
    });

    it('Should call publisher constructor', () => {
        new PublisherReporter(publisher);

        expect(publisherMock).toHaveBeenCalledWith(publisher);
    });

    it('Should print onInit', () => {
        new PublisherReporter(publisher);

        expect(onInitEventMock).toHaveBeenCalledWith('publisher', publisher);
        expect(onInitTrigger).toHaveBeenCalled();
    });

    it('Should resolve onMessageReceived', done => {
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {
            done();
        });

    });


    it('Should reject onMessageReceived', done => {
        const reason = 'reasonMessage';
        publishMock = jest.fn(() => Promise.reject(reason));
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().catch((err) => {
            expect(err).toBe(reason);

            done();
        });

    });

    it('Should add Publisher test - success', done => {
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {
            const report = publisherReporter.getReport();
            expect(report.name).toBe(publisher.name);
            const publisherTest = report.tests[0];
            expect(publisherTest.name).toBe('Published');
            expect(publisherTest.valid).toBeTruthy();

            done();
        });

    });

    it('Should add Publisher test - fail', done => {
        const reason = 'reasonMessage';
        publishMock = jest.fn(() => Promise.reject(reason));
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().catch(() => {
            const report = publisherReporter.getReport();
            expect(report.name).toBe(publisher.name);
            const publisherTest = report.tests[0];
            expect(publisherTest.name).toBe('Published');
            expect(publisherTest.valid).toBeFalsy();

            done();
        });

    });


    it('Should print onMessageReceived', done => {
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {

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
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {

            const report = publisherReporter.getReport();
            expect(report.name).toBe(publisher.name);
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
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {

            const report = publisherReporter.getReport();
            expect(report.name).toBe(publisher.name);
            const responseMessageTest = report.tests[1];
            expect(responseMessageTest.name).toBe('Response message received');
            expect(responseMessageTest.valid).toBeTruthy();

            done();
        });

    });

    it('Should print onFinish', () => {
        new PublisherReporter(publisher).onFinish();

        expect(onFinishEventMock).toHaveBeenCalledWith('publisher', publisherMock());
        expect(onFinishTrigger).toHaveBeenCalled();
    });

});
