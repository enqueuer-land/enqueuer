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
var mqtt = require("mqtt");
var MqttPublisher = /** @class */ (function (_super) {
    __extends(MqttPublisher, _super);
    function MqttPublisher(publish) {
        var _this = _super.call(this, publish) || this;
        _this.brokerAddress = "";
        _this.topic = "";
        if (publish) {
            _this.brokerAddress = publish.brokerAddress;
            _this.topic = publish.topic;
        }
        return _this;
    }
    MqttPublisher.prototype.execute = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var client = mqtt.connect(_this.brokerAddress, { clientId: 'mqtt_' + (1 + Math.random() * 4294967295).toString(16) });
            if (client.connected) {
                client.publish(_this.topic, _this.payload);
                client.end();
                resolve(_this);
            }
            else {
                client.on("connect", function () {
                    client.publish(_this.topic, _this.payload);
                    client.end();
                    resolve(_this);
                });
            }
            client.on("error", function (err) { return reject(err); });
        });
    };
    return MqttPublisher;
}(publisher_1.Publisher));
exports.MqttPublisher = MqttPublisher;
