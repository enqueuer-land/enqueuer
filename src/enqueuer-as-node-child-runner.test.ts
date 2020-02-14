import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {NotificationEmitter} from './notifications/notification-emitter';
import {EnqueuerAsNodeChildRunner} from "./enqueuer-as-node-child-runner";
import {Notifications} from "./notifications/notifications";


jest.mock('./requisition-runners/requisition-runner');
jest.mock('./notifications/notification-emitter');

const processOnMock = jest.fn();
process.on = processOnMock;

const processSendMock = jest.fn();
process.send = processSendMock;

const runMock = jest.fn();
const requisitionRunnerConstructorMock = jest.fn(() => ({run: runMock}));
// @ts-ignore
RequisitionRunner.mockImplementation(requisitionRunnerConstructorMock);

let notificationEmitterOnMock = jest.fn();
// @ts-ignore
NotificationEmitter.on.mockImplementation(notificationEmitterOnMock);

describe('EnqueuerAsNodeChildRunner', () => {
    beforeEach(() => {
        processOnMock.mockClear();
        processSendMock.mockClear();
        requisitionRunnerConstructorMock.mockClear();
        runMock.mockClear();
        notificationEmitterOnMock.mockClear();
    });

    it('should listen to message', async () => {
        const statusCode = await new EnqueuerAsNodeChildRunner().execute(true);

        expect(statusCode).toBe(0);
        expect(processOnMock.mock.calls[0][0]).toBe('message');
    });

    it('should send exit message', async () => {
        const statusCode = 0;
        await new EnqueuerAsNodeChildRunner().execute(true);

        expect(processOnMock.mock.calls[1][0]).toBe('exit');

        const onExitCallback = processOnMock.mock.calls[1][1];
        onExitCallback(statusCode);

        expect(processSendMock).toHaveBeenCalledWith({
            event: 'PROCESS_EXIT',
            value: statusCode
        });
    });

    it('should run enqueuer runner when a message arrives', async () => {
        const requisition = 'value';
        await new EnqueuerAsNodeChildRunner().execute(true);

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback({event: 'runRequisition', value: requisition});
        expect(requisitionRunnerConstructorMock).toHaveBeenCalledWith(requisition);
        expect(runMock).toHaveBeenCalled();
    });

    it('should not run enqueuer when a message arrives but is not a requisitions', async () => {
        await new EnqueuerAsNodeChildRunner().execute(true);

        const onMessageCallback = processOnMock.mock.calls[0][1];
        onMessageCallback({event: 'NOT_A REQUISITION'});
        expect(requisitionRunnerConstructorMock).not.toHaveBeenCalled();
        expect(runMock).not.toHaveBeenCalled();
    });

    it('should register senders to every notification', async () => {
        await new EnqueuerAsNodeChildRunner().execute(true);

        const everyNotificationKey = Object.keys(Notifications)
            .map((key: any) => Notifications[key])
            .filter((key: any) => typeof key === 'number')

        expect(notificationEmitterOnMock.mock.calls.map((call: any) => call[0]))
            .toEqual(everyNotificationKey);
    });

    it('should send when notification is emitted', async () => {
        await new EnqueuerAsNodeChildRunner().execute(true);

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
