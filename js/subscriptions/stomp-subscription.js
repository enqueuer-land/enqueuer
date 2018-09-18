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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const Stomp = require('stomp-client');
let StompSubscription = class StompSubscription extends subscription_1.Subscription {
    constructor(subscriptionModel) {
        super(subscriptionModel);
        this.address = subscriptionModel.address;
        this.port = subscriptionModel.port;
        this.user = subscriptionModel.user;
        this.password = subscriptionModel.password;
        this.queue = subscriptionModel.queue;
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.trace(`Stomp waiting for a message related to queue ${this.queue}`);
            this.client.subscribe(this.queue, (message, headers) => {
                logger_1.Logger.trace(`Stomp message received header ${JSON.stringify(headers, null, 2)}`);
                resolve({ payload: message, headers: headers });
            });
            this.client.once('error', (err) => {
                reject(err);
            });
        });
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.debug(`Stomp subscription connecting to ${this.address}:${this.port}`);
            this.client = new Stomp(this.address, this.port, this.user, this.password);
            this.client.connect((sessionId) => {
                logger_1.Logger.debug(`Stomp subscription connected id ${sessionId}`);
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.unsubscribe(this.queue);
        });
    }
};
StompSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'stomp' }),
    __metadata("design:paramtypes", [Object])
], StompSubscription);
exports.StompSubscription = StompSubscription;
