"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_transformer_1 = require("class-transformer");
var requisition_1 = require("./requisition");
var jsonSub = require('json-sub')();
var RequisitionParser = /** @class */ (function () {
    function RequisitionParser() {
    }
    RequisitionParser.prototype.parse = function (requisitionMessage) {
        var parsedRequisition = JSON.parse(requisitionMessage);
        var variablesReplacedRequisition = this.replaceVariables(parsedRequisition);
        var requisitionReturn = this.deserialize(variablesReplacedRequisition);
        // console.log("Requisition: " + JSON.stringify(requisitionReturn, null, 2));
        return requisitionReturn;
    };
    RequisitionParser.prototype.replaceVariables = function (parsedRequisition) {
        var requisitionWithNoVariables = Object.assign({}, parsedRequisition);
        var variables = parsedRequisition.variables;
        delete requisitionWithNoVariables.variables;
        var add = jsonSub.addresser(requisitionWithNoVariables, variables);
        return JSON.stringify(add);
    };
    RequisitionParser.prototype.deserialize = function (requisitionJson) {
        try {
            return class_transformer_1.deserialize(requisition_1.Requisition, requisitionJson);
        }
        catch (e) {
            throw new Error("Error parsing requisition: " + e);
        }
    };
    return RequisitionParser;
}());
exports.RequisitionParser = RequisitionParser;
