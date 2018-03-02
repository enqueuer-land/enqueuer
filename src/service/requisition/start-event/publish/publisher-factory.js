"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_publisher_1 = require("./mqtt-publisher");
var http_publisher_1 = require("./http-publisher");
var PublisherFactory = /** @class */ (function () {
    function PublisherFactory() {
    }
    PublisherFactory.prototype.createPublisher = function (publishRequisition) {
        if (publishRequisition.protocol === "mqtt")
            return new mqtt_publisher_1.MqttPublisher(publishRequisition);
        if (publishRequisition.protocol === "http")
            return new http_publisher_1.HttpPublisher(publishRequisition);
        return null;
    };
    return PublisherFactory;
}());
exports.PublisherFactory = PublisherFactory;
