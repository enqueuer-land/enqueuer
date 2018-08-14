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
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const kafka_node_1 = require("kafka-node");
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
            const consumer = new kafka_node_1.Consumer(this.client, [{
                    topic: this.options.topic,
                    offset: this.latestOffset
                }], {
                fromOffset: true
            });
            consumer.on('message', (message) => {
                logger_1.Logger.trace('Kafka message data: ' + JSON.stringify(message, null, 2));
                resolve(message.value);
                consumer.close(() => {
                    logger_1.Logger.trace('Kafka consumer is closed');
                });
            });
            consumer.on('error', (error) => {
                logger_1.Logger.error('Kafka error message data: ' + JSON.stringify(error, null, 2));
                reject(error);
                consumer.close(() => {
                    logger_1.Logger.trace('Kafka consumer is closed');
                });
            });
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.offset.fetchLatestOffsets([this.options.topic], (error, offsets) => {
                    if (error) {
                        logger_1.Logger.error(`Error fetching kafka topic ${JSON.stringify(error, null, 2)}`);
                        reject(error);
                    }
                    else {
                        this.latestOffset = offsets[this.options.topic][0];
                        logger_1.Logger.trace('Kafka subscription is connected');
                        resolve();
                    }
                });
                this.offset.on('error', (error) => {
                    logger_1.Logger.error(`Error offset kafka ${JSON.stringify(error, null, 2)}`);
                    reject(error);
                });
            }
            catch (exc) {
                logger_1.Logger.error(`Error connecting kafka ${JSON.stringify(exc, null, 2)}`);
                reject(exc);
            }
        });
    }
    unsubscribe() {
        this.client.close();
    }
};
KafkaSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'kafka' }),
    __metadata("design:paramtypes", [Object])
], KafkaSubscription);
exports.KafkaSubscription = KafkaSubscription;
