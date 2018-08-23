import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Tester} from '../testers/tester';
import {OnInitEventExecutor} from "./on-init-event-executor";
import {Initializable} from "./initializable";

let addArgumentMock = jest.fn();
let dynamicFunctionExecuteMock = jest.fn();

jest.mock('../dynamic-functions/dynamic-function-controller');
DynamicFunctionController.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: dynamicFunctionExecuteMock,
    };
});

let getReportMock = jest.fn(() => {
    return [{
        errorDescription: 'desc',
        valid: false,
        label: 'label'
    }]
});

let addTestMock = jest.fn();

jest.mock('../testers/tester');
Tester.mockImplementation(() => {
    return {
        addTest: addTestMock,
        getReport: getReportMock
    };
});

let initializable: Initializable;

describe('OnInitEventExecutor', () => {

    beforeEach(() => {
        initializable = {
            onInit: {
                store: {
                  key: 'value'
                },
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

    it('Should catch function creation exception', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);
        dynamicFunctionExecuteMock = jest.fn(() => {throw 'nqr';} );

        eventExecutor.trigger();

        expect(addTestMock).toHaveBeenCalledWith({"errorDescription": 'nqr', "label": "Event ran", "valid": false});
    });
});

