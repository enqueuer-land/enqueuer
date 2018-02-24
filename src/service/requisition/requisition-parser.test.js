"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requisition_parser_1 = require("./requisition-parser");
require("mocha");
describe('RequisitionParser test', function () {
    it('mqtt protocol', function () {
        var factory = new requisition_parser_1.RequisitionParser();
        var requisition = {
            protocol: "mqtt"
        };
        // const service = factory.createService(requisition);
        // expect(service).to.be.instanceOf(MqttService);
    });
    it('undefined protocol', function () {
        var factory = new requisition_parser_1.RequisitionParser();
        var requisition = {
            protocol: "unknown"
        };
        // expect(() => factory.createService(requisition)).to.throw;
    });
});
