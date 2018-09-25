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
const kafka_node_1 = require("kafka-node");
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
let KafkaSubscription = class KafkaSubscription extends subscription_1.Subscription {
    constructor(subscriptionModel) {
        super(subscriptionModel);
        subscriptionModel.options.requestTimeout = subscriptionModel.options.requestTimeout || 10000;
        subscriptionModel.options.connectTimeout = subscriptionModel.options.connectTimeout || 10000;
        this.options = subscriptionModel.options;
        this.client = new kafka_node_1.KafkaClient(subscriptionModel.client);
        this.offset = new kafka_node_1.Offset(this.client);
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            const consumer = this.createConsumer();
            consumer.on('message', (message) => {
                logger_1.Logger.trace('Kafka message data: ' + new javascript_object_notation_1.JavascriptObjectNotation().stringify(message));
                resolve(message);
                consumer.close(() => {
                    logger_1.Logger.trace('Kafka consumer is closed');
                });
            });
            consumer.on('error', (error) => {
                logger_1.Logger.error('Kafka error message data: ' + new javascript_object_notation_1.JavascriptObjectNotation().stringify(error));
                reject(error);
                consumer.close(() => {
                    logger_1.Logger.trace('Kafka consumer is closed');
                });
            });
        });
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            const objectNotation = new javascript_object_notation_1.JavascriptObjectNotation();
            try {
                this.client.on('error', (err) => {
                    const message = `Error subscribing to kafka ${objectNotation.stringify(err)}`;
                    logger_1.Logger.error(message);
                    throw message;
                });
                return yield this.fetchOffset();
            }
            catch (exc) {
                const message = `Error connecting kafka ${objectNotation.stringify(exc)}`;
                logger_1.Logger.error(message);
                throw message;
            }
        });
    }
    fetchOffset() {
        logger_1.Logger.debug(`Fetching kafka subscription offset`);
        return new Promise((resolve, reject) => {
            try {
                this.offset.fetchLatestOffsets([this.options.topic], (error, offsets) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        logger_1.Logger.error(`Error fetching kafka topic ${new javascript_object_notation_1.JavascriptObjectNotation().stringify(error)}`);
                        reject(error);
                    }
                    else {
                        this.latestOffset = offsets[this.options.topic][0];
                        logger_1.Logger.trace('Kafka offset fetched');
                        this.ableToUnsubscribe = true;
                        resolve();
                    }
                }));
            }
            catch (err) {
                reject(err);
            }
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ableToUnsubscribe) {
                this.client.close();
            }
        });
    }
    createConsumer() {
        return new kafka_node_1.Consumer(this.client, [{
                topic: this.options.topic,
                offset: this.latestOffset
            }], {
            fromOffset: true
        });
    }
};
KafkaSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'kafka' }),
    __metadata("design:paramtypes", [Object])
], KafkaSubscription);
exports.KafkaSubscription = KafkaSubscription;
