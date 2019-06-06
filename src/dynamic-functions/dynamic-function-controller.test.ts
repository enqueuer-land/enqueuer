import {DynamicFunctionController} from './dynamic-function-controller';

describe('DynamicFunctionController', () => {

    it('Should add argument and pass it to the function', () => {
        const testerExecutor: DynamicFunctionController = new DynamicFunctionController('name.value++;');
        const arg = {value: 2};

        testerExecutor.addArgument('name', arg);
        testerExecutor.execute();

        expect(arg.value).toBe(3);
    });

    it('Should bind this', done => {
        const self = {
            method(value: number) {
                expect(value).toBe(3);
                done();
            }
        };
        const testerExecutor: DynamicFunctionController = new DynamicFunctionController('this.method(3);', self);

        testerExecutor.execute();
    });

    it('Should throw function creation error', () => {
        const testerExecutor: DynamicFunctionController = new DynamicFunctionController('inv;alid statement');

        expect(() => testerExecutor.execute()).toThrow();
    });

    it('Should throw function execution error', () => {
        const testerExecutor: DynamicFunctionController = new DynamicFunctionController('notDefined++');

        expect(() => testerExecutor.execute()).toThrow();
    });

});

