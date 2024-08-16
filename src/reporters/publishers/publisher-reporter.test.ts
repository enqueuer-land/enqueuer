import {PublisherReporter} from './publisher-reporter';
import {ProtocolManager} from '../../plugins/protocol-manager';
import {DynamicModulesManager} from '../../plugins/dynamic-modules-manager';
import {EventExecutor} from '../../events/event-executor';
import {DefaultHookEvents} from '../../models/events/event';

jest.mock('../../plugins/dynamic-modules-manager');
// @ts-ignore
DynamicModulesManager.getInstance.mockImplementation(() => {
    return {
        getProtocolManager: () => new ProtocolManager()
    };
});

let publishMock = jest.fn(() => Promise.resolve('publishResult')) as any;
let publisherMock = jest.fn(() => {
    return {
        publish: publishMock,
        registerHookEventExecutor: () => ({})
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
// @ts-expect-error
EventExecutor.mockImplementation(() => ({
    execute: () => [],
    addArgument: () => {}
}));

const publisher = {
    name: 'pubName',
    id: 'id'
} as any;

describe('PublisherReporter', () => {
    beforeEach(() => {
        publishMock = jest.fn(() => Promise.resolve(true));
    });

    it('Should call publisher constructor', () => {
        new PublisherReporter(publisher);

        expect(publisherMock).toHaveBeenCalledWith(publisher);
    });

    it('Should call onInit', () => {
        // @ts-expect-error
        EventExecutor.mockImplementation = jest.fn();

        new PublisherReporter(publisher);

        expect(EventExecutor).toHaveBeenCalledWith(publisher, 'onInit', 'publisher');
    });

    it('Should resolve onMessageReceived', (done) => {
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().then(() => {
            done();
        });
    });

    it('Should reject onMessageReceived', (done) => {
        const reason = 'reasonMessage';
        publishMock = jest.fn(() => Promise.reject(reason));
        const publisherReporter = new PublisherReporter(publisher);
        publisherReporter.publish().catch((err) => {
            expect(err).toBe(reason);

            done();
        });
    });

    it('Should keep id', (done) => {
        const publisherReporter = new PublisherReporter(publisher as any);
        publisherReporter.publish().then(() => {
            const report = publisherReporter.getReport();
            expect(report.id).toBe(publisher.id);
            done();
        });
    });

    it('Should add Publisher test - success', (done) => {
        const publisherReporter = new PublisherReporter(publisher as any);
        publisherReporter.publish().then(() => {
            publisherReporter.onFinish();
            const report = publisherReporter.getReport();
            expect(report.name).toBe(publisher.name);
            const publisherTest = report.hooks![DefaultHookEvents.ON_FINISH].tests[0];
            expect(publisherTest.name).toBe('Published');
            expect(publisherTest.valid).toBeTruthy();

            done();
        });
    });

    it('Should add Publisher test - fail', (done) => {
        const reason = 'reasonMessage';
        publishMock = jest.fn(() => Promise.reject(reason));
        const publisherReporter = new PublisherReporter(publisher as any);
        publisherReporter.publish().catch(() => {
            publisherReporter.onFinish();
            const report = publisherReporter.getReport();
            expect(report.name).toBe(publisher.name);
            const publisherTest = report.hooks![DefaultHookEvents.ON_FINISH].tests[0];
            expect(publisherTest.name).toBe('Published');
            expect(publisherTest.valid).toBeFalsy();

            done();
        });
    });

    it('Should call onFinish', async () => {
        // @ts-expect-error
        EventExecutor.mockClear();
        // @ts-expect-error
        EventExecutor.mockImplementation = jest.fn();

        await new PublisherReporter(publisher).onFinish();

        expect(EventExecutor).toHaveBeenNthCalledWith(
            2,
            {
                publish: expect.any(Function),
                registerHookEventExecutor: expect.any(Function)
            },
            'onFinish',
            'publisher'
        );
    });
});
