import {EnqueuerStarter} from './enqueuer-starter';
import {SingleRunExecutor} from './run-modes/single-run-executor';

let executorMock = jest.fn(() => Promise.resolve(true));
jest.mock('./run-modes/single-run-executor');
// @ts-ignore
SingleRunExecutor.mockImplementation(() => {
    return {
        execute: executorMock
    };
});
describe('EnqueuerStarter', () => {
    it('Should detect run mode', () => {
        const enqueuerStarter = new EnqueuerStarter();

        expect(SingleRunExecutor).toHaveBeenCalled();
    });

    it('Should translate true to 0', async () => {
        expect.assertions(2);
        executorMock = jest.fn(() => Promise.resolve(true));

        expect(await new EnqueuerStarter().start()).toBe(0);

        expect(executorMock).toHaveBeenCalled();
    });

    it('Should translate false to 1', async () => {
        expect.assertions(2);
        executorMock = jest.fn(() => Promise.resolve(false));

        expect(await new EnqueuerStarter().start()).toBe(1);

        expect(executorMock).toHaveBeenCalled();
    });

    it('Should translate error to -1', async () => {
        expect.assertions(2);
        executorMock = jest.fn(() => Promise.reject('error'));

        expect(await new EnqueuerStarter().start()).toBe(-1);

        expect(executorMock).toHaveBeenCalled();
    });

});
