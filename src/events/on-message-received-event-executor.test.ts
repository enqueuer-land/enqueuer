import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {OnMessageReceivedEventExecutor} from './on-message-received-event-executor';
import {MessageReceiver} from '../models/events/message-receiver';

let addArgumentMock = jest.fn();
let dynamicFunctionExecuteMock = jest.fn();

jest.mock('../dynamic-functions/dynamic-function-controller');
DynamicFunctionController.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: dynamicFunctionExecuteMock,
    };
});

let messageReceiver: MessageReceiver;

describe('OnMessageReceivedEventExecutor', () => {
    beforeEach(() => {
        messageReceiver = {
            messageReceived: {
                deep: 'value'
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
        };
    });

    it('Should add name and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('messageReceiverName', messageReceiver);
    });

    it('Should return empty array if no event is passed', () => {
        const noOnMessageReceived = {messageReceiver};
        delete noOnMessageReceived.onMessageReceived;
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', noOnMessageReceived);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(0);
    });

    it('Should return empty array if no message is received is passed', () => {
        const noOnMessageReceived = {messageReceiver};
        delete noOnMessageReceived.messageReceived;
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', noOnMessageReceived);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(0);
    });

    it('Should add message and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('message', {deep: 'value'});
    });

    it('Should decompose message and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('deep', 'value');
    });

    it('Should add store and pass it to the script executor', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('store', expect.any(Object));
    });

});
