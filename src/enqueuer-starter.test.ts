import {EnqueuerStarter} from "./enqueuer-starter";
import {SingleRunExecutor} from "./run-modes/single-run-executor";


let executorMock = jest.fn(() => Promise.resolve(true));
jest.mock('./run-modes/single-run-executor');
SingleRunExecutor.mockImplementation(() => {
    return {
        execute: executorMock
    }
});
describe('EnqueuerStarter', () => {
    const configuration = {
        runMode: 'daemon'
    };

    it('Should detect run mode', () => {
        new EnqueuerStarter(configuration);

        expect(SingleRunExecutor).toHaveBeenCalledWith(configuration);
    });

    it('Should translate true to 0', () => {
        expect.assertions(2);
        executorMock = jest.fn(() => Promise.resolve(true));


        expect(new EnqueuerStarter(configuration).start()).resolves.toBe(0);

        expect(executorMock).toHaveBeenCalled();
    });

    it('Should translate false to 1', () => {
        expect.assertions(2);
        executorMock = jest.fn(() => Promise.resolve(false));


        expect(new EnqueuerStarter(configuration).start()).resolves.toBe(1);

        expect(executorMock).toHaveBeenCalled();
    });

    it('Should translate error to -1', () => {
        expect.assertions(2);
        executorMock = jest.fn(() => Promise.reject('error'));

        expect(new EnqueuerStarter(configuration).start()).resolves.toBe(-1);

        expect(executorMock).toHaveBeenCalled();
    });

});
