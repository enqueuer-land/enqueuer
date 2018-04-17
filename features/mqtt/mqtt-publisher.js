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
var logger_1 = require("../loggers/logger");
var mqtt = require("mqtt");
var MqttPublisher = /** @class */ (function (_super) {
    __extends(MqttPublisher, _super);
    function MqttPublisher(publish) {
        var _this = _super.call(this, publish) || this;
        _this.brokerAddress = publish.brokerAddress;
        _this.topic = publish.topic;
        _this.options = publish.options || {};
        _this.options.clientId = _this.options.clientId || 'mqtt_' + (1 + Math.random() * 4294967295).toString(16);
        return _this;
    }
    MqttPublisher.prototype.publish = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connectClient()
                .then(function (client) {
                logger_1.Logger.debug(("Mqtt publishing in " + _this.brokerAddress + " - " + _this.topic + ": " + _this.payload)
                    .substr(0, 100).concat("..."));
                client.publish(_this.topic, _this.payload, function (err) {
                    if (err) {
                        logger_1.Logger.error("Error publishing in " + _this.brokerAddress + " - " + _this.topic + ": " + err);
                        reject(err);
                    }
                });
                client.end();
                resolve();
            });
        });
    };
    MqttPublisher.prototype.connectClient = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var client = mqtt.connect(_this.brokerAddress, _this.options);
            if (client.connected)
                resolve(client);
            else {
                client.on("connect", function () { return resolve(client); });
            }
            client.on("error", function (err) { return reject(err); });
        });
    };
    MqttPublisher = __decorate([
        injector_1.Injectable(function (publishRequisition) { return publishRequisition.type === "mqtt"; })
    ], MqttPublisher);
    return MqttPublisher;
}(publisher_1.Publisher));
exports.MqttPublisher = MqttPublisher;
