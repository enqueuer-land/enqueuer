import {PublisherReporter} from './publisher-reporter';
import {ProtocolManager} from '../../plugins/protocol-manager';
import {DynamicModulesManager} from '../../plugins/dynamic-modules-manager';
import {EventExecutor} from '../../events/event-executor';

jest.mock('../../plugins/dynamic-modules-manager');
// @ts-ignore
DynamicModulesManager.getInstance.mockImplementation(() => {
    return {
        getProtocolManager: () => new ProtocolManager()
    };
});

let publishMock = jest.fn(() => Promise.resolve({}));
let publisherMock = jest.fn(() => {
    return {
        publish: publishMock
    };
});

jest.mock('../../plugins/protocol-manager');
// @ts-ignore
ProtocolManager.mockImplementation(() => {
    return {
        createPublisher: publisherMock
    };
});

jest.mock('../../events/event-executor');
EventExecutor.mockImplementation(() => ({
    execute: () => [],
    addArgument: () => {
    }
}));

const publisher = {
    name: 'pubName',
    id: 'id'
};

describe('PublisherReporter', () => {
    beforeEach(() => {
        publishMock = jest.fn(() => Promise.resolve(true));
    });

    it('Should call publisher constructor', () => {
        new PublisherReporter(publisher);

        expect(publisherMock).toHaveBeenCalledWith(publisher);
    });

    it('Should call onInit', () => {
        EventExecutor.mockImplementation = jest.fn();

        new PublisherReporter(publisher);

        expect(EventExecutor).toHaveBeenCalledWith(publisher, 'onInit', 'publisher');
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

    it('Should keep id', done => {
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {
            const report = publisherReporter.getReport();
            expect(report.id).toBe(publisher.id);
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

    it('Should call onMessageReceived', async () => {
        EventExecutor.mockClear();
        EventExecutor.mockImplementation = jest.fn();

        await new PublisherReporter(publisher).publish();

        expect(EventExecutor).toHaveBeenNthCalledWith(2, {publish: expect.any(Function)}, 'onMessageReceived', 'publisher');
    });

    it('Should add onMessageReceived tests - no message', done => {
        publisherMock = jest.fn(() => {
            return {
                publish: publishMock,
                onMessageReceived: {
                    assertions: 'blah'
                }
            };
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

    it('Should add onMessageReceived tests - message', done => {
        publisherMock = jest.fn(() => {
            return {
                publish: publishMock,
                messageReceived: 'hey',
                onMessageReceived: {
                    assertions: 'blah'
                }
            };
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

    it('Should print onFinish', async () => {
        EventExecutor.mockClear();
        EventExecutor.mockImplementation = jest.fn();

        await new PublisherReporter(publisher).onFinish();

        expect(EventExecutor).toHaveBeenNthCalledWith(2, {
            messageReceived: 'hey',
            onMessageReceived: {'assertions': 'blah'},
            publish: expect.any(Function)
        }, 'onFinish', 'publisher');
    });

});
