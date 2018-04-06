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
const subscription_1 = require("./subscription");
const injector_1 = require("../injector/injector");
const mqtt = require("mqtt");
let MqttSubscription = class MqttSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.brokerAddress = subscriptionAttributes.brokerAddress;
        this.topic = subscriptionAttributes.topic;
    }
    receiveMessage() {
        this.client.subscribe(this.topic);
        return new Promise((resolve, reject) => {
            if (!this.client.connected)
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.topic}`);
            this.client.on('message', (topic, message) => resolve(message.toString()));
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(this.brokerAddress, { clientId: 'mqtt_' + (1 + Math.random() * 4294967295).toString(16) });
            if (!this.client.connected) {
                this.client.on("connect", () => resolve());
            }
            else {
                resolve();
            }
            this.client.on("error", (error) => {
                reject(error);
            });
        });
    }
    unsubscribe() {
        if (this.client) {
            this.client.unsubscribe(this.topic);
            this.client.end(true);
        }
        delete this.client;
    }
};
MqttSubscription = __decorate([
    injector_1.Injectable((subscriptionAttributes) => subscriptionAttributes.type === "mqtt"),
    __metadata("design:paramtypes", [Object])
], MqttSubscription);
exports.MqttSubscription = MqttSubscription;
