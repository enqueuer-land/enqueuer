import {ScriptExecutor} from '../testers/script-executor';
import {Tester} from '../testers/tester';
import {AssertionCodeGenerator} from '../testers/assertion-code-generator';
import {OnMessageReceivedEventExecutor} from './on-message-received-event-executor';
import {MessageReceiver} from './message-receiver';

let addArgumentMock = jest.fn();
let executeMock = jest.fn();

jest.mock('../testers/script-executor');
ScriptExecutor.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: executeMock,
    };
});

let generateMock = jest.fn();
jest.mock('../testers/assertion-code-generator');
AssertionCodeGenerator.mockImplementation(() => {
    return {
        generate: generateMock
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

    it('Should create assertions', () => {
        const eventExecutor: OnMessageReceivedEventExecutor = new OnMessageReceivedEventExecutor('messageReceiverName', messageReceiver);

        eventExecutor.trigger();

        expect(generateMock).toHaveBeenCalledTimes(2);
        expect(generateMock).toHaveBeenNthCalledWith(1, {"expected": 2, "isEqualTo": 2, "name": "equalName"});
        expect(generateMock).toHaveBeenNthCalledWith(2, {"isDefined": "x", "name": "isDefinedName"});
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

