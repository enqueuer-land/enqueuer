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
let UdsSubscription = class UdsSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.ipc = require('node-ipc');
        this.ipc.config.id = subscriptionAttributes.id;
        this.path = subscriptionAttributes.path;
        this.ipc.config.retry = 1500;
        this.ipc.config.silent = true;
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.ipc.server.on(this.path, (message, socket) => {
                resolve(message);
            });
            this.ipc.server.on('error', (error) => {
                reject(error);
            });
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.ipc.serve();
            this.ipc.server.start();
            resolve();
        });
    }
    unsubscribe() {
        this.ipc.server.end();
    }
};
UdsSubscription = __decorate([
    injector_1.Injectable((subscriptionAttributes) => subscriptionAttributes.type === "uds"),
    __metadata("design:paramtypes", [Object])
], UdsSubscription);
exports.UdsSubscription = UdsSubscription;
