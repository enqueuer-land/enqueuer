import {DynamicFunctionController} from '../dynamic-functions/dynamic-function-controller';
import {Finishable} from '../models/events/finishable';
import {OnFinishEventExecutor} from './on-finish-event-executor';

let addArgumentMock = jest.fn();
let dynamicFunctionExecuteMock = jest.fn();

jest.mock('../dynamic-functions/dynamic-function-controller');
DynamicFunctionController.mockImplementation(() => {
    return {
        addArgument: addArgumentMock,
        execute: dynamicFunctionExecuteMock,
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
        };
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

        expect(addArgumentMock).toHaveBeenCalledWith('store', expect.any(Object));
    });

});
