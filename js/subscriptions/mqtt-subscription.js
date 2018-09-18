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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const mqtt = __importStar(require("mqtt"));
let MqttSubscription = class MqttSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.brokerAddress = subscriptionAttributes.brokerAddress;
        this.topic = subscriptionAttributes.topic;
        this.options = subscriptionAttributes.options || {};
        this.options.connectTimeout = this.options.connectTimeout || 10 * 1000;
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            if (!this.client.connected) {
                reject(`Error trying to receive message. Subscription is not connected yet: ${this.topic}`);
            }
            else {
                logger_1.Logger.debug('Mqtt message receiver resolver initialized');
                this.messageReceivedResolver = resolve;
            }
        });
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.trace(`Mqtt connecting to broker ${this.brokerAddress}`);
            this.client = mqtt.connect(this.brokerAddress, this.options);
            logger_1.Logger.trace(`Mqtt client created`);
            if (!this.client.connected) {
                this.client.on('connect', () => {
                    this.subscribeToTopic(reject, resolve);
                });
            }
            else {
                this.subscribeToTopic(reject, resolve);
            }
            this.client.on('error', (error) => {
                logger_1.Logger.error(`Error subscribing to mqtt ${error}`);
                reject(error);
            });
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                this.client.unsubscribe(this.topic);
                this.client.end(true);
            }
            delete this.client;
        });
    }
    subscribeToTopic(reject, resolve) {
        logger_1.Logger.trace(`Mqtt subscribing on topic ${this.topic}`);
        this.client.subscribe(this.topic, (err) => {
            if (err) {
                reject(err);
            }
            else {
                logger_1.Logger.trace(`Mqtt subscribed on topic ${this.topic}`);
                this.client.on('message', (topic, payload) => this.gotMessage(topic, payload));
                resolve();
            }
        });
    }
    gotMessage(topic, payload) {
        logger_1.Logger.debug('Mqtt got message');
        if (this.messageReceivedResolver) {
            this.messageReceivedResolver({ topic: topic, payload: payload });
        }
        else {
            logger_1.Logger.error('Mqtt message receiver resolver is not initialized');
        }
    }
};
MqttSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'mqtt' }),
    __metadata("design:paramtypes", [Object])
], MqttSubscription);
exports.MqttSubscription = MqttSubscription;
