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

    it('should create meta function', function () {
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
            "reports": []
        };

        const executionReturn = executor.execute();

        expect(mockExecuteFunction).toBeCalledWith(expect.arrayContaining([parameters]));
        expect(JSON.stringify(executionReturn.report)).toBe(JSON.stringify(expectedReport));
        expect(executionReturn.report.exc).not.toBeDefined();
    });

    it('should handle exception', function () {

        class ExceptionMetaFunction implements MetaFunctionCreator {
            createFunction = () => jest.fn(() => {throw new Error("Error executing function")});
        }

        const exceptionFunction = new ExceptionMetaFunction();
        const executor = new MetaFunctionExecutor(exceptionFunction);

        const executionReturn = executor.execute();

        expect(executionReturn.report.exc).toBeDefined();
    });

});

