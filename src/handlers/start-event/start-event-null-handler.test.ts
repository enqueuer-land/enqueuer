import {StartEventNullHandler} from "./start-event-null-handler";

describe('StartEventNullHandler', function() {

    it('should return rejected promise in start', function() {
        const nullHandler: StartEventNullHandler = new StartEventNullHandler("argument");

        return nullHandler.start().catch(rejected => {
            expect(rejected).toMatch("argument")
        })
    });

    it('should return constructor\'s argument in the error description', function() {
        const nullHandler: StartEventNullHandler = new StartEventNullHandler("argument");

        const report = nullHandler.getReport();
            expect(report).toMatch("argument")
    });

});