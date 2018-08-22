import {ScriptExecutor} from '../testers/script-executor';
import {Tester} from '../testers/tester';
import {EventAsserter} from './event-asserter';
import {AssertionCodeGenerator} from '../testers/assertion-code-generator';

let addArgumentMock = jest.fn();
let executeMock = jest.fn();

jest.mock('../testers/script-executor');
ScriptExecutor.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: executeMock
    };
});

let generateMock = jest.fn();
jest.mock('../testers/assertion-code-generator');
AssertionCodeGenerator.mockImplementation(() => {
    return {
        generate: generateMock
    };
});

describe('EventAsserter', () => {

    it('Should create assertions', () => {
        const assertions = [
            {
                name: 'equalName',
                expected: 2,
                isEqualTo: 2
            },
            {
                name: 'isDefinedName',
                isDefined: 'x'
            },
            {
                unamed: 'x'
            }
        ];
        const eventTestExecutor: EventAsserter = new EventAsserter({assertions: assertions});

        eventTestExecutor.assert();

        expect(generateMock).toHaveBeenCalledTimes(3);
        expect(generateMock).toHaveBeenNthCalledWith(1, {"expected": 2, "isEqualTo": 2, "name": "equalName"});
        expect(generateMock).toHaveBeenNthCalledWith(2, {"isDefined": "x", "name": "isDefinedName"});
        expect(generateMock).toHaveBeenNthCalledWith(3, {"unamed": "x", "name": "Assertion #2"});
    });

    it('Should add argument and pass it to the script executor', () => {
        const eventTestExecutor: EventAsserter = new EventAsserter();
        const arg = {value: 2};

        eventTestExecutor.addArgument('name', arg);
        eventTestExecutor.assert();

        expect(addArgumentMock).toHaveBeenCalledWith('name', arg);
    });

    it('Should add store and pass it to the script executor', () => {
        const eventTestExecutor: EventAsserter = new EventAsserter();

        eventTestExecutor.assert();

        expect(addArgumentMock).toHaveBeenCalledWith('store', {});
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventTestExecutor: EventAsserter = new EventAsserter();

        eventTestExecutor.assert();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should catch function error', () => {
        const eventTestExecutor: EventAsserter = new EventAsserter();
        executeMock = jest.fn(() => {throw new Error('pp')});

        const tests = eventTestExecutor.assert();

        expect(tests.length).toBe(1);
        expect(JSON.stringify(tests[0])).toBe(`{\"valid\":false,\"label\":\"Script code is valid\",\"errorDescription\":\"Error: pp\"}`);
    });

});

