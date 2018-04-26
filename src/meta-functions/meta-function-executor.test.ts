import {MetaFunctionExecutor} from "./meta-function-executor";
import {MetaFunctionCreator} from "./meta-function-creator";

describe('MetaFunctionExecutor', () => {

    it('should call meta function', function () {
        let mockCreateFunction = jest.fn();
        class FakeMetaFunction implements MetaFunctionCreator {
            createBody = mockCreateFunction;
        }
        const fakeMetaFunction = new FakeMetaFunction();
        new MetaFunctionExecutor(fakeMetaFunction);

        expect(mockCreateFunction).toBeCalled();
    });

    it('should insert data', function () {
        class FakeMetaFunction implements MetaFunctionCreator {
            createBody = () => {
                return    `let test = {};
                    let report = {};
                    test['passing'] = true;
                    test['failing'] = false;
                    report['hello'] = 'world';
                    return {
                            test: test,
                            report: report
                     };`;

            };
        }
        const executor = new MetaFunctionExecutor(new FakeMetaFunction());
        const expectedReport =  {
            "tests": [
                {name: "passing", valid: true},
                {name: "failing", valid: false}
            ],
            "report":
            {
                hello: "world"
            }
        };

        const executionReturn = executor.execute();

        expect(JSON.stringify(executionReturn)).toBe(JSON.stringify(expectedReport));
        expect(executionReturn.exc).not.toBeDefined();
    });

    it('should handle function runtime exception', function () {

        class ExceptionMetaFunction implements MetaFunctionCreator {
            createBody = () => {"let oi;"};
        }

        const exceptionFunction = new ExceptionMetaFunction();
        const executor = new MetaFunctionExecutor(exceptionFunction);

        const executionReturn = executor.execute();

        expect(executionReturn.exception).toMatch("runtime")
    });

    it('should handle function compile time exception', function () {
        class ExceptionMetaFunction implements MetaFunctionCreator {
            createBody = () => { return {
                                    test: 'useless'
                                }}
        }

        const executor = new MetaFunctionExecutor(new ExceptionMetaFunction());
        const executionReturn = executor.execute();

        expect(executionReturn.exception).toMatch("compile")
    });

});

