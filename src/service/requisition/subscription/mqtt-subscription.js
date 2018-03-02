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
var subscription_1 = require("./subscription");
var mqtt = require("mqtt");
var MqttSubscription = /** @class */ (function (_super) {
    __extends(MqttSubscription, _super);
    function MqttSubscription(subscriptionAttributes) {
        var _this = _super.call(this, subscriptionAttributes) || this;
        _this.brokerAddress = "";
        _this.topic = "";
        _this.client = null;
        _this.brokerAddress = subscriptionAttributes.brokerAddress;
        _this.topic = subscriptionAttributes.topic;
        return _this;
    }
    MqttSubscription.prototype.subscribe = function (onMessageReceived, onSubscriptionCompleted) {
        var _this = this;
        this.client = mqtt.connect(this.brokerAddress, { clientId: 'mqtt_' + (1 + Math.random() * 4294967295).toString(16) });
        this.client.subscribe(this.topic);
        if (!this.client.connected) {
            this.client.on("connect", function () {
                _this.client.on('message', function (topic, message) {
                    _this.message = message.toString();
                    _this.client.end();
                    delete _this.client;
                    onMessageReceived(_this);
                });
                onSubscriptionCompleted(_this);
            });
        }
        else {
            this.client.on('message', function (topic, message) {
                _this.message = message.toString();
                _this.client.end(true);
                delete _this.client;
                onMessageReceived(_this);
            });
            onSubscriptionCompleted(this);
        }
        return true;
    };
    MqttSubscription.prototype.unsubscribe = function () {
        if (this.client)
            this.client.end();
        delete this.client;
    };
    return MqttSubscription;
}(subscription_1.Subscription));
exports.MqttSubscription = MqttSubscription;
