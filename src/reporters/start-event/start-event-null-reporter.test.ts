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


    it('should resolve promise in start', () => {
        const nullHandler: StartEventNullReporter = new StartEventNullReporter();

        expect(nullHandler.start()).resolves.toBeUndefined();
    });

    it('should resolve report', () => {
        const nullHandler: StartEventNullReporter = new StartEventNullReporter();

        const report = nullHandler.getReport();
        expect(report).toEqual({});
    });

});