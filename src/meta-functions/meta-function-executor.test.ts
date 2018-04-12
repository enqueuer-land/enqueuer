import {MetaFunctionExecutor} from "./meta-function-executor";
import {MetaFunctionCreator} from "./meta-function-creator";

let mockExecuteFunction = jest.fn(() => {
    return {
        test: {
            passing: true,
            failing: false
        },
        report: {
            hello: 'world'
        }
    }
})

let mockCreateFunction = jest.fn(() => mockExecuteFunction);

class FakeMetaFunction implements MetaFunctionCreator {
    createFunction = mockCreateFunction;
}

describe('MetaFunctionExecutor', () => {

    it('should call meta function', function () {
        const fakeMetaFunction = new FakeMetaFunction();
        new MetaFunctionExecutor(fakeMetaFunction);

        expect(mockCreateFunction).toBeCalled();
    });

    it('should insert data', function () {
        const fakeMetaFunction = new FakeMetaFunction();
        const parameters = "functionExtraParams";
        const executor = new MetaFunctionExecutor(fakeMetaFunction, parameters);
        const expectedReport =  {
            "passingTests": [
                "passing"
            ],
            "failingTests": [
                "failing"
            ],
            "reports":
            {
                hello: "world"
            }
        };

        const executionReturn = executor.execute();

        expect(mockExecuteFunction).toBeCalledWith(expect.arrayContaining([parameters]));
        expect(JSON.stringify(executionReturn)).toBe(JSON.stringify(expectedReport));
        expect(executionReturn.exc).not.toBeDefined();
    });

    it('should handle function exception', function () {

        class ExceptionMetaFunction implements MetaFunctionCreator {
            createFunction = () => () => {throw "Virgs"};
        }

        const exceptionFunction = new ExceptionMetaFunction();
        const executor = new MetaFunctionExecutor(exceptionFunction);

        const executionReturn = executor.execute();

        expect(executionReturn.exception["Function runtime error"]).toBe("Virgs");
    });

});

