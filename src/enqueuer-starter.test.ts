import {Container} from 'conditional-injector';
import {EnqueuerStarter} from "./enqueuer-starter";
import {EnqueuerExecutor} from "./executors/enqueuer-executor";

let executorMock = jest.fn(() => Promise.resolve(true));
let createMock = jest.fn(() => {
    return {
        execute: executorMock
    }
});
let containerMock = jest.fn(() => {
    return {
        create: createMock
    }
});

jest.mock('conditional-injector');
Container.subclassesOf.mockImplementation(containerMock);

describe('EnqueuerStarter', () => {
    const runMode = 'daemon';
    const configuration = {
        getRunMode: () => runMode
    };

    it('Should detect run mode', () => {
        new EnqueuerStarter(configuration);

        expect(containerMock).toHaveBeenCalledWith(EnqueuerExecutor);
        expect(createMock).toHaveBeenCalledWith(runMode);
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