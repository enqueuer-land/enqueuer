import {StartEventNullHandler} from "./start-event-null-handler";

describe('StartEventNullHandler', function() {

    it('should return rejected promise in start', () => {
        const nullHandler: StartEventNullHandler = new StartEventNullHandler("argument");

        return expect(nullHandler.start()).rejects.toMatch("argument");
    });

    it('should return constructor\'s argument in the error description', () => {
        const nullHandler: StartEventNullHandler = new StartEventNullHandler("argument");

        const report = nullHandler.getReport();
        expect(report).toMatch("argument")
    });

});