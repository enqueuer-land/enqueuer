import {ScriptExecutor} from './script-executor';

describe('ScriptExecutor', () => {

    it('Should add argument and pass it to the function', () => {
        const testerExecutor: ScriptExecutor = new ScriptExecutor('name.value++;');
        const arg = {value: 2};

        testerExecutor.addArgument('name', arg);
        testerExecutor.execute();

        expect(arg.value).toBe(3);
    });

    it('Should throw function creation error', () => {
        const testerExecutor: ScriptExecutor = new ScriptExecutor('invalid statement');

        expect(() => testerExecutor.execute()).toThrow();
    });

    it('Should throw function execution error', () => {
        const testerExecutor: ScriptExecutor = new ScriptExecutor('notDefined++');

        expect(() => testerExecutor.execute()).toThrow();
    });

});

