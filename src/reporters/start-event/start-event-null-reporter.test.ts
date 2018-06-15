import {StartEventNullReporter} from './start-event-null-reporter';

describe('StartEventNullReporter', function() {

    it('should return rejected promise in start', () => {
        const nullHandler: StartEventNullReporter = new StartEventNullReporter('argument');

        return expect(nullHandler.start()).rejects.toMatch('argument');
    });

    it('should return constructor\'s argument in the error description', () => {
        const nullHandler: StartEventNullReporter = new StartEventNullReporter('argument');

        const report = nullHandler.getReport();
        expect(report).toMatch('argument')
    });

});