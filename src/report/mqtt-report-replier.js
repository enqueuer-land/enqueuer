"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt = require("mqtt");
var MqttReportReplier = /** @class */ (function () {
    function MqttReportReplier(mqttProperties) {
        this.mqttProperties = mqttProperties;
        this.client = mqtt.connect(mqttProperties.brokerAddress, { clientId: 'mqtt_' + (1 + Math.random() * 4294967295).toString(16) });
    }
    MqttReportReplier.prototype.report = function (report) {
        if (this.client.connected) {
            this.client.publish(this.mqttProperties.topic, report.toString());
            this.client.end();
            return true;
        }
        return false;
    };
    return MqttReportReplier;
}());
exports.MqttReportReplier = MqttReportReplier;
