import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Tester} from '../testers/tester';
import {Finishable} from "./finishable";
import {OnFinishEventExecutor} from "./on-finish-event-executor";

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

let finishable: Finishable;

describe('OnFinishEventExecutor', () => {

    beforeEach(() => {
        finishable = {
            onFinish: {
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
                    isDefined: 'x'
                }]
            }
        }
    });

    it('Should add argument and pass it to the script executor', () => {
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', finishable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('finishableName', finishable);
    });

    it('Should return empty array if no event is passed', () => {
        const noFinish = {};
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', noFinish);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(0);
    });

    it('Should add store and pass it to the script executor', () => {
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', finishable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('store', {});
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', finishable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should add tester and pass it to the script executor', () => {
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', finishable);
        delete finishable.onFinish.assertions[1];

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('tester', new Tester());
    });

    it('Should map Test to TestModel', () => {
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', finishable);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(1);
        expect(testModels[0]).toEqual({"description": "desc", "name": "label", "valid": false});
    });

    it('Should catch function creation exception', () => {
        const eventExecutor: OnFinishEventExecutor = new OnFinishEventExecutor('finishableName', finishable);
        dynamicFunctionExecuteMock = jest.fn(() => {throw 'nqr';} );

        eventExecutor.trigger();

        expect(addTestMock).toHaveBeenCalledWith({"errorDescription": "Error running event 'onFinish': nqr", "label": "Event ran", "valid": false});
    });
});

