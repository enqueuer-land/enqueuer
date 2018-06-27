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
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const kafka_node_1 = require("kafka-node");
let KafkaPublisher = class KafkaPublisher extends publisher_1.Publisher {
    constructor(publisherProperties) {
        super(publisherProperties);
        this.topic = publisherProperties.topic;
        const client = new kafka_node_1.KafkaClient(publisherProperties.client);
        this.producer = new kafka_node_1.Producer(client);
        this.kafkaPayload = [
            { topic: this.topic, messages: this.payload }
        ];
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.producer.on('ready', () => {
                logger_1.Logger.trace(`Kafka publisher is ready`);
                this.producer.send(this.kafkaPayload, (err, data) => {
                    if (err) {
                        logger_1.Logger.error(`Error sending kafka message ${JSON.stringify(err, null, 2)}`);
                        return reject(err);
                    }
                    logger_1.Logger.trace(`Kafka publish message data ${JSON.stringify(data, null, 2)}`);
                    return resolve();
                });
            });
            this.producer.on('error', (err) => {
                logger_1.Logger.error(`Error on publishing kafka message ${JSON.stringify(err, null, 2)}`);
                return reject(err);
            });
        });
    }
};
KafkaPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'kafka' }),
    __metadata("design:paramtypes", [Object])
], KafkaPublisher);
exports.KafkaPublisher = KafkaPublisher;
