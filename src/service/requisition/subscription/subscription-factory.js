"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_subscription_1 = require("./mqtt-subscription");
var SubscriptionFactory = /** @class */ (function () {
    function SubscriptionFactory() {
    }
    SubscriptionFactory.prototype.createSubscription = function (subscriptionAttributes) {
        if (subscriptionAttributes.protocol === "mqtt")
            return new mqtt_subscription_1.MqttSubscription(subscriptionAttributes);
        return null;
    };
    return SubscriptionFactory;
}());
exports.SubscriptionFactory = SubscriptionFactory;
