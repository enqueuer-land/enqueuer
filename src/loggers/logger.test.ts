import * as log4js from 'log4js';
import {Logger} from "./logger";

jest.mock("log4js");

let trace = jest.fn();
let debug = jest.fn();
let info = jest.fn();
let warning = jest.fn();
let error = jest.fn();
let fatal = jest.fn();
log4js.getLogger.mockImplementation(() => {
    return {
        trace: trace,
        debug: debug,
        info: info,
        warn: warning,
        error: error,
        fatal: fatal,
    };
});


describe('DateController', function() {
    beforeEach(() => {
       trace.mockClear();
       debug.mockClear();
       info.mockClear();
       warning.mockClear();
       error.mockClear();
       fatal.mockClear();
    });

    it('should pass message through trace', function () {
        log4js.getLogger();

        Logger.trace("msg");

        expect(trace).toBeCalledWith("msg");
        expect(debug).not.toBeCalled();
        expect(info).not.toBeCalled();
        expect(warning).not.toBeCalled();
        expect(error).not.toBeCalled();
        expect(fatal).not.toBeCalled();
    });

    it('should pass message through debug', function () {
        log4js.getLogger();

        Logger.debug("msg");

        expect(trace).not.toBeCalled();
        expect(debug).toBeCalledWith("msg");
        expect(info).not.toBeCalled();
        expect(warning).not.toBeCalled();
        expect(error).not.toBeCalled();
        expect(fatal).not.toBeCalled();
    });

    it('should pass message through info', function () {
        log4js.getLogger();

        Logger.info("msg");

        expect(trace).not.toBeCalled();
        expect(debug).not.toBeCalled();
        expect(info).toBeCalledWith("msg");
        expect(warning).not.toBeCalled();
        expect(error).not.toBeCalled();
        expect(fatal).not.toBeCalled();
    });

    it('should pass message through warning', function () {
        log4js.getLogger();

        Logger.warning("msg");

        expect(trace).not.toBeCalled();
        expect(debug).not.toBeCalled();
        expect(info).not.toBeCalled();
        expect(warning).toBeCalledWith("msg");
        expect(error).not.toBeCalled();
        expect(fatal).not.toBeCalled();
    });

    it('should pass message through error', function () {
        log4js.getLogger();

        Logger.error("msg");

        expect(trace).not.toBeCalled();
        expect(debug).not.toBeCalled();
        expect(info).not.toBeCalled();
        expect(warning).not.toBeCalled();
        expect(error).toBeCalledWith("msg");
        expect(fatal).not.toBeCalled();
    });

    it('should pass message through fatal', function () {
        log4js.getLogger();

        Logger.fatal("msg");

        expect(trace).not.toBeCalled();
        expect(debug).not.toBeCalled();
        expect(info).not.toBeCalled();
        expect(warning).not.toBeCalled();
        expect(error).not.toBeCalled();
        expect(fatal).toBeCalledWith("msg");
    });

});