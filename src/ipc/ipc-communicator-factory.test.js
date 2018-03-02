"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enqueuer_starter_1 = require("./enqueuer-starter");
var chai_1 = require("chai");
require("mocha");
var uds_reader_1 = require("./uds-reader");
var file_requisition_reader_1 = require("./file-requisition-reader");
describe('IpcFactory test', function () {
    describe('IpcFactory test', function () {
        it('uds protocol', function () {
            var configurationFile = {
                protocol: "uds"
            };
            var ipcFactory = new enqueuer_starter_1.EnqueuerStarter();
            var created = ipcFactory.create();
            chai_1.expect(created).to.be.instanceOf(uds_reader_1.UdsReader);
        });
        it('Configuration file', function () {
            var configurationFile = {
                protocol: "uds"
            };
            var commandLine = {
                inputRequisitionFile: "filename"
            };
            var ipcFactory = new enqueuer_starter_1.EnqueuerStarter();
            var created = ipcFactory.create();
            chai_1.expect(created).to.be.instanceOf(file_requisition_reader_1.InputRequisitionFile);
        });
        it('undefined protocol', function () {
            var configurationFile = {
                protocol: "unknown"
            };
            var ipcFactory = new enqueuer_starter_1.EnqueuerStarter();
            chai_1.expect(function () { return ipcFactory.create(); }).to.throw;
        });
    });
});
