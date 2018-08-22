import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Tester} from '../testers/tester';
import {AssertionCodeGenerator} from '../testers/assertion-code-generator';
import {OnInitEventExecutor} from "./on-init-event-executor";
import {Initializable} from "./initializable";

let addArgumentMock = jest.fn();
let executeMock = jest.fn();

jest.mock('../dynamic-functions/dynamic-function-controller');
DynamicFunctionController.mockImplementation(() => {
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



let initializable: Initializable;

describe('OnInitEventExecutor', () => {

    beforeEach(() => {
        initializable = {
            onInit: {
                script: 'code',
                assertions: [
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
      const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        eventExecutor.trigger();

        expect(generateMock).toHaveBeenCalledTimes(2);
        expect(generateMock).toHaveBeenNthCalledWith(1, {"expected": 2, "isEqualTo": 2, "name": "equalName"});
        expect(generateMock).toHaveBeenNthCalledWith(2, {"isDefined": "x", "name": "isDefinedName"});
    });

    it('Should add argument and pass it to the script executor', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('initializableName', initializable);
    });

    it('Should add store and pass it to the script executor', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('store', {});
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);
        delete initializable.onInit.assertions[1];

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should map Test to TestModel', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(1);
        expect(testModels[0]).toEqual({"description": "desc", "name": "label", "valid": false});
    });
});

