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
var publisher_1 = require("./publisher");
var injector_1 = require("../injector/injector");
var amqp = require('amqp');
var AmqpPublisher = /** @class */ (function (_super) {
    __extends(AmqpPublisher, _super);
    function AmqpPublisher(publish) {
        var _this = _super.call(this, publish) || this;
        _this.options = publish.options;
        _this.queueName = publish.queueName;
        _this.messageOptions = publish.messageOptions || {};
        return _this;
    }
    AmqpPublisher.prototype.publish = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connection = amqp.createConnection(_this.options);
            _this.connection.on('ready', function () {
                var exchange = _this.connection.exchange();
                exchange.on('open', function () {
                    exchange.publish(_this.queueName, _this.payload, _this.messageOptions, function (errored, err) {
                        return reject(err);
                    });
                    _this.connection.disconnect();
                    _this.connection.end();
                    return resolve();
                });
            });
            _this.connection.on('error', function (err) {
                return reject(err);
            });
        });
    };
    AmqpPublisher = __decorate([
        injector_1.Injectable(function (publishRequisition) { return publishRequisition.type === "amqp"; })
    ], AmqpPublisher);
    return AmqpPublisher;
}(publisher_1.Publisher));
exports.AmqpPublisher = AmqpPublisher;
