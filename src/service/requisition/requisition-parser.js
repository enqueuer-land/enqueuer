"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonSub = require('json-sub')();
var class_transformer_1 = require("class-transformer");
var enqueuer_service_1 = require("../enqueuer-service");
var requisition_1 = require("./requisition");
var RequisitionParser = /** @class */ (function () {
    function RequisitionParser() {
    }
    RequisitionParser.prototype.createService = function (requisitionMessage) {
        var parsedRequisition = JSON.parse(requisitionMessage);
        var variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        if (parsedRequisition.protocol == "mqtt") {
            return new enqueuer_service_1.EnqueuerService(this.parse(variablesReplacedRequisition));
        }
        throw new Error("Undefined requisition protocol: " + parsedRequisition.protocol);
    };
    RequisitionParser.prototype.replaceVariables = function (parsedRequisition) {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        var variables = parsedRequisition.variables;
        delete requisitionWithNoVariables.variables;
        var add = jsonSub.addresser(requisitionWithNoVariables, variables);
        return JSON.stringify(add);
    };
    RequisitionParser.prototype.parse = function (requisition) {
        try {
            return class_transformer_1.deserialize(requisition_1.Requisition, requisition);
        }
        catch (e) {
            throw new Error("Error parsing requisition: " + e);
        }
    };
    return RequisitionParser;
}());
exports.RequisitionParser = RequisitionParser;
