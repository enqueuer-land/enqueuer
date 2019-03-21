import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Initializable} from '../models/events/initializable';
import {OnInitEventExecutor} from './on-init-event-executor';

let addArgumentMock = jest.fn();
let dynamicFunctionExecuteMock = jest.fn();

jest.mock('../dynamic-functions/dynamic-function-controller');
DynamicFunctionController.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: dynamicFunctionExecuteMock,
    };
});

let addTestMock = jest.fn();

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
                        isDefined: 'x'
                    }]
            }
        };
    });

    it('Should add argument and pass it to the script executor', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('initializableName', initializable);
    });

    it('Should return empty array if no event is passed', () => {
        const noInit = {initializable};
        delete initializable.onInit;
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', noInit);

        const testModels = eventExecutor.trigger();

        expect(testModels.length).toBe(0);
    });

    it('Should add store and pass it to the script executor', () => {
        const eventExecutor: OnInitEventExecutor = new OnInitEventExecutor('initializableName', initializable);

        eventExecutor.trigger();

        expect(addArgumentMock).toHaveBeenCalledWith('store', expect.any(Object));
    });

});
