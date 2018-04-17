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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var publisher_1 = require("../../src/publishers/publisher");
var injector_1 = require("../../src/injector/injector");
var logger_1 = require("../../src/loggers/logger");
var request = require("request");
var HttpClientPublisher = /** @class */ (function (_super) {
    __extends(HttpClientPublisher, _super);
    function HttpClientPublisher(publish) {
        var _this = _super.call(this, publish) || this;
        _this.url = publish.url;
        _this.method = publish.method;
        _this.payload = JSON.stringify(publish.payload);
        _this.headers = publish.headers;
        if (_this.headers['Content-Length'] == null) {
            if (Buffer.isBuffer(_this.payload)) {
                _this.headers["Content-Length"] = _this.payload.length;
            }
            else {
                _this.headers["Content-Length"] = Buffer.byteLength(_this.payload);
            }
        }
        return _this;
    }
    HttpClientPublisher.prototype.publish = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            logger_1.Logger.debug(("Http-client-publisher " + _this.url + "(" + _this.method + ") - " + _this.payload)
                .substr(0, 100).concat("..."));
            request({
                url: _this.url,
                method: _this.method,
                headers: _this.headers,
                data: _this.payload,
                body: _this.payload
            }, function (error, response, body) {
                response.setEncoding(null);
                if (error) {
                    reject("Error to publish http: " + error);
                }
                else {
                    resolve();
                }
            });
        });
    };
    HttpClientPublisher = __decorate([
        injector_1.Injectable(function (publishRequisition) { return publishRequisition.type === "http-client"; })
    ], HttpClientPublisher);
    return HttpClientPublisher;
}(publisher_1.Publisher));
exports.HttpClientPublisher = HttpClientPublisher;
