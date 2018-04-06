"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const injector_1 = require("../injector/injector");
const logger_1 = require("../loggers/logger");
const mqtt = require("mqtt");
let MqttPublisher = class MqttPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.brokerAddress = publish.brokerAddress;
        this.topic = publish.topic;
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.connectClient()
                .then(client => {
                logger_1.Logger.debug(`Mqtt publishing in ${this.brokerAddress} - ${this.topic}: ${this.payload}`
                    .substr(0, 100).concat("..."));
                client.publish(this.topic, this.payload, (err) => {
                    if (err) {
                        logger_1.Logger.error(`Error publishing in ${this.brokerAddress} - ${this.topic}: ${err}`);
                        reject(err);
                    }
                });
                client.end();
                resolve();
            });
        });
    }
    connectClient() {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(this.brokerAddress, { clientId: 'mqtt_' + (1 + Math.random() * 4294967295).toString(16) });
            if (client.connected)
                resolve(client);
            else {
                client.on("connect", () => resolve(client));
            }
            client.on("error", (err) => reject(err));
        });
    }
};
MqttPublisher = __decorate([
    injector_1.Injectable((publishRequisition) => publishRequisition.type === "mqtt"),
    __metadata("design:paramtypes", [Object])
], MqttPublisher);
exports.MqttPublisher = MqttPublisher;
