"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var publisher_1 = require("./publisher");
var request = require("request");
var HttpPublisher = /** @class */ (function (_super) {
    __extends(HttpPublisher, _super);
    function HttpPublisher(publish) {
        var _this = _super.call(this, publish) || this;
        _this.endpoint = "";
        _this.method = "";
        _this.header = {};
        if (publish) {
            _this.endpoint = publish.endpoint;
            _this.method = publish.method;
            _this.header = publish.header;
        }
        return _this;
    }
    HttpPublisher.prototype.execute = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            request.post({
                url: _this.endpoint,
                body: _this.payload
            }, function (error, response, body) {
                if (error) {
                    reject("Error to publish http: " + error);
                }
                else {
                    resolve(_this);
                }
            });
        });
    };
    return HttpPublisher;
}(publisher_1.Publisher));
exports.HttpPublisher = HttpPublisher;
