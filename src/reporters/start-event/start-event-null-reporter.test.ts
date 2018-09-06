import {StartEventNullReporter} from './start-event-null-reporter';
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');

describe('StartEventNullReporter', function() {

    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toHaveBeenCalledWith();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
    });


    it('should return rejected promise in start', () => {
        const nullHandler: StartEventNullReporter = new StartEventNullReporter('argument');

        expect(nullHandler.start()).rejects.toMatch('argument');
    });

    it('should return constructor\'s argument in the error errorDescription', () => {
        const nullHandler: StartEventNullReporter = new StartEventNullReporter('argument');

        const report = nullHandler.getReport();
        expect(report).toMatch('argument')
    });

});