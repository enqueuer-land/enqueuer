import {NotificationEmitter} from './notifications/notification-emitter';
import {EnqueuerAsNodeChildRunner} from './enqueuer-as-node-child-runner';
import {Notifications} from './notifications/notifications';
import {ChildRequisitionRunner} from './run-as-child/child-requisition-runner';
import {AssertDescriber} from './run-as-child/assert-describer';
import {ModuleAdder} from './run-as-child/module-adder';
import {ProtocolDescriber} from './run-as-child/protocol-describer';
import {StoreCleaner} from './run-as-child/store-cleaner';


jest.mock('./notifications/notification-emitter');
jest.mock('./run-as-child/child-requisition-runner');
jest.mock('./run-as-child/assert-describer');
jest.mock('./run-as-child/module-adder');
jest.mock('./run-as-child/protocol-describer');
jest.mock('./run-as-child/store-cleaner');

const processOnMock = jest.fn();
process.on = processOnMock;

const processSendMock = jest.fn();
process.send = processSendMock;

const replierProcessMock = jest.fn();
const replierConstructorMock = jest.fn(() => ({process: replierProcessMock}));
// @ts-ignore
ChildRequisitionRunner.mockImplementation(replierConstructorMock);
// @ts-ignore
AssertDescriber.mockImplementation(replierConstructorMock);
// @ts-ignore
ModuleAdder.mockImplementation(replierConstructorMock);
// @ts-ignore
ProtocolDescriber.mockImplementation(replierConstructorMock);
// @ts-ignore
StoreCleaner.mockImplementation(replierConstructorMock);

let notificationEmitterOnMock = jest.fn();
// @ts-ignore
NotificationEmitter.on.mockImplementation(notificationEmitterOnMock);

describe('EnqueuerAsNodeChildRunner', () => {
    beforeEach(() => {
        processOnMock.mockClear();
        processSendMock.mockClear();
        replierConstructorMock.mockClear();
        replierProcessMock.mockClear();
        notificationEmitterOnMock.mockClear();
    });

    it('should listen to message', async () => {
        const enqueuerAsNodeChildRunner = new EnqueuerAsNodeChildRunner();
        const statusCode = await enqueuerAsNodeChildRunner.execute();

        expect(statusCode).toBe(0);
        expect(processOnMock.mock.calls[0][0]).toBe('message');
    });

    it('should send exit message', async () => {
        const statusCode = 0;
        await new EnqueuerAsNodeChildRunner().execute();

        expect(processOnMock.mock.calls[1][0]).toBe('exit');

        const onExitCallback = processOnMock.mock.calls[1][1];
        onExitCallback(statusCode);

        expect(processSendMock).toHaveBeenCalledWith({
            event: 'PROCESS_EXIT',
            value: statusCode
        });
    });

    it('should do nothing when message is unknown', async () => {
        const message = {event: 'UNKNOWN'};

        await new EnqueuerAsNodeChildRunner().execute();

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback(message);
        expect(replierProcessMock).not.toHaveBeenCalled();
    });

    it('should add modules list when requested', async () => {
        const message = {event: 'ADD_MODULE', value: 'value'};

        await new EnqueuerAsNodeChildRunner().execute();

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback(message);
        expect(replierConstructorMock).toHaveBeenCalled();
        expect(replierProcessMock).toHaveBeenCalledWith(message);
    });

    it('should get protocols list when requested', async () => {
        const message = {event: 'GET_PROTOCOLS', value: 'value'};

        await new EnqueuerAsNodeChildRunner().execute();

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback(message);
        expect(replierConstructorMock).toHaveBeenCalled();
        expect(replierProcessMock).toHaveBeenCalledWith(message);
    });

    it('should get asserters list when requested', async () => {
        const message = {event: 'GET_ASSERTERS', value: 'value'};

        await new EnqueuerAsNodeChildRunner().execute();

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback(message);
        expect(replierConstructorMock).toHaveBeenCalled();
        expect(replierProcessMock).toHaveBeenCalledWith(message);
    });

    it('should run enqueuer runner when a message arrives', async () => {
        const message = {event: 'RUN_REQUISITION', value: 'value'};

        await new EnqueuerAsNodeChildRunner().execute();

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback(message);
        expect(replierConstructorMock).toHaveBeenCalled();
        expect(replierProcessMock).toHaveBeenCalledWith(message);
    });

    it('should register senders to every notification', async () => {
        await new EnqueuerAsNodeChildRunner().execute();

        const everyNotificationKey = Object.keys(Notifications)
            .map((key: any) => Notifications[key])
            .filter((key: any) => typeof key === 'number');

        expect(notificationEmitterOnMock.mock.calls.map((call: any) => call[0]))
            .toEqual(everyNotificationKey);
    });

    it('should proxy message when notification is emitted', async () => {
        await new EnqueuerAsNodeChildRunner().execute();

        const report = {cycle: {}};
        report.cycle = report;

        notificationEmitterOnMock.mock.calls[0][1]({report});
        expect(processSendMock).toHaveBeenCalledWith({
            event: 'REQUISITION_FINISHED',
            value: {
                report: {}
            }
        });
    });

});
