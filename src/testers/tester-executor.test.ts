import {TesterExecutor} from './tester-executor';
import {Tester} from "./tester";
import {Store} from "./store";

const testIsEqualToMock = jest.fn();
const testGetReportMock = jest.fn(() => {
    return "anything";
});

jest.mock("./tester");
Tester.mockImplementation(() => {
    return {
        isEqualTo: testIsEqualToMock,
        getReport: testGetReportMock
    };
});

describe('TesterExecutor', () => {

    it('Should add argument and pass it to the function', () => {
        const testerExecutor: TesterExecutor = new TesterExecutor('name.value++;');
        const arg = {value: 2};

        testerExecutor.addArgument('name', arg);
        testerExecutor.execute();

        expect(arg.value).toBe(3);
    });

    it('Should call tester assertions', () => {
        const testerExecutor: TesterExecutor = new TesterExecutor(`tester.isEqualTo('label', 2, 3);`);

        const tests = testerExecutor.execute();

        expect(tests).toBe("anything");
        expect(testIsEqualToMock).toHaveBeenCalledWith('label', 2, 3);
        expect(testGetReportMock).toHaveBeenCalled();
    });

    it('Should call store', () => {
        let getter: any = {};
        new TesterExecutor(`store.name = 'initial';`).execute();
        const tester: TesterExecutor = new TesterExecutor(`getter.name = store.name; console.log(store.name)`);
        tester.addArgument('getter', getter);

        tester.execute();

        expect(getter.name).toBe('initial');
    });

    it('Should catch function creation error', () => {
        const testerExecutor: TesterExecutor = new TesterExecutor('invalid statement');

        const tests = testerExecutor.execute();

        expect(tests.length).toBe(1);
        expect(tests[0].valid).toBeFalsy();
        expect(tests[0].label).toBe("Function created");
        expect(tests[0].description).toBe("SyntaxError: Unexpected identifier");
    });

    it('Should catch function execution error', () => {
        const testerExecutor: TesterExecutor = new TesterExecutor('notDefined++');

        const tests = testerExecutor.execute();

        expect(tests.length).toBe(1);
        expect(tests[0].valid).toBeFalsy();
        expect(tests[0].label).toBe("Function executed");
        expect(tests[0].description).toBe("ReferenceError: notDefined is not defined");
    });

});

