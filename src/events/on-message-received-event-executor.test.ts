import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Tester} from '../testers/tester';
import {OnMessageReceivedEventExecutor} from './on-message-received-event-executor';
import {MessageReceiver} from './message-receiver';

let addArgumentMock = jest.fn();
let executeMock = jest.fn();

jest.mock('../dynamic-functions/dynamic-function-controller');
DynamicFunctionController.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: executeMock,
    };
});

let getReportMock = jest.fn(() => {
    return [{
        errorDescription: 'desc',
        valid: false,
        label: 'label'
    }]
});

jest.mock('../testers/tester');
Tester.mockImplementation(() => {
    return {
        getReport: getReportMock
    };
});


let messageReceiver: MessageReceiver;

describe('OnMessageReceivedEventExecutor', () => {
    beforeEach(() => {
        messageReceiver = {
            messageReceived: {
                deep: "value"
            },
            onMessageReceived: {
                script: 'code',
                assertions:
                    [
                        {
                            name: 'equalName',
                            expected: 2,
                            isEqualTo: 2
                        },
                        {
                            name: 'isDefinedName',
                            isDefined: 'x'
                        }]
            }
        }
    });

    it('Should add name and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('messageReceiverName', messageReceiver);
    });

    it('Should add message and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('message', {deep: "value"});
    });

    it('Should decompose message and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('deep', 'value');
    });

    it('Should add store and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('store', {});
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);
        delete messageReceiver.onMessageReceived.assertions[1];

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should map Test to TestModel', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(1);
        expect(testModels[0]).toEqual({"description": "desc", "name": "label", "valid": false});
    });
});

