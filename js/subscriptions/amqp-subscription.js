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
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const amqp = __importStar(require("amqp"));
const string_random_creator_1 = require("../timers/string-random-creator");
let AmqpSubscription = class AmqpSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.queueName = subscriptionAttributes.queueName || new string_random_creator_1.StringRandomCreator().create(8);
    }
    receiveMessage() {
        return new Promise((resolve) => {
            logger_1.Logger.debug(`Amqp subscription registering receiveMessage resolver`);
            this.messageReceiverPromiseResolver = resolve;
        });
    }
    subscribe() {
        this.connection = amqp.createConnection(this.options);
        return new Promise((resolve, reject) => {
            this.connection.once('ready', () => {
                this.connection.queue(this.queueName, (queue) => {
                    queue.subscribe((message, headers, deliveryInfo) => this.gotMessage(message, headers, deliveryInfo));
                    if (this.exchange && this.routingKey) {
                        logger_1.Logger.debug(`Amqp subscription binding ${this.queueName} to exchange: ${this.exchange} and routingKey: ${this.routingKey}`);
                        queue.bind(this.exchange, this.routingKey, () => {
                            logger_1.Logger.debug(`Queue ${this.queueName} bound`);
                            resolve();
                        });
                    }
                    else if (this.queueName) {
                        logger_1.Logger.debug(`Queue ${this.queueName} bound to the default exchange`);
                        resolve();
                    }
                    else {
                        reject(`Impossible to subscribe: ${this.queueName}:${this.exchange}:${this.routingKey}`);
                    }
                });
            });
            this.connection.on('error', (err) => reject(err));
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                this.connection.disconnect();
            }
            delete this.connection;
        });
    }
    gotMessage(message, headers, deliveryInfo) {
        if (this.messageReceiverPromiseResolver) {
            const result = { payload: message, headers: headers, deliveryInfo: deliveryInfo };
            this.messageReceiverPromiseResolver(result);
        }
        else {
            logger_1.Logger.warning(`Queue ${this.queueName} is not subscribed yet`);
        }
    }
};
AmqpSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'amqp' }),
    __metadata("design:paramtypes", [Object])
], AmqpSubscription);
exports.AmqpSubscription = AmqpSubscription;
