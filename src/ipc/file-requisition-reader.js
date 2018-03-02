"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("../conf/configuration");
var fs = require("fs");
var FileRequisitionReader = /** @class */ (function () {
    function FileRequisitionReader() {
    }
    FileRequisitionReader.prototype.start = function () {
        return new Promise(function (resolve, reject) {
            fs.readFile(configuration_1.Configuration.getInputRequisitionFileName(), function (error, data) {
                if (error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    };
    return FileRequisitionReader;
}());
exports.FileRequisitionReader = FileRequisitionReader;
