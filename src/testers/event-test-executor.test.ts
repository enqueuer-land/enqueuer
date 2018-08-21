import {ScriptExecutor} from './script-executor';
import {Tester} from './tester';
import {EventTestExecutor} from './event-test-executor';

let addArgumentMock = jest.fn();
let executeMock = jest.fn();

jest.mock('./script-executor');
ScriptExecutor.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: executeMock
    };
});

describe('EventTestExecutor', () => {

    it('Should add argument and pass it to the script executor', () => {
        const eventTestExecutor: EventTestExecutor = new EventTestExecutor();
        const arg = {value: 2};

        eventTestExecutor.addArgument('name', arg);
        eventTestExecutor.execute();

        expect(addArgumentMock).toHaveBeenCalledWith('name', arg);
    });

    it('Should add store and pass it to the script executor', () => {
        const eventTestExecutor: EventTestExecutor = new EventTestExecutor();

        eventTestExecutor.execute();

        expect(addArgumentMock).toHaveBeenCalledWith('store', {});
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventTestExecutor: EventTestExecutor = new EventTestExecutor();

        eventTestExecutor.execute();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should catch function error', () => {
        const eventTestExecutor: EventTestExecutor = new EventTestExecutor();
        executeMock = jest.fn(() => {throw new Error('pp')});

        const tests = eventTestExecutor.execute();

        expect(tests.length).toBe(1);
        expect(JSON.stringify(tests[0])).toBe(`{\"valid\":false,\"label\":\"Script code is valid\",\"description\":{}}`);
    });

});

