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
var amqp = require('amqp');
let AmqpPublisher = class AmqpPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.options = publish.options;
        this.queueName = publish.queueName;
        this.messageOptions = publish.messageOptions || {};
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.options);
            this.connection.on('ready', () => {
                const exchange = this.connection.exchange();
                exchange.on('open', () => {
                    exchange.publish(this.queueName, this.payload, this.messageOptions, (errored, err) => {
                        return reject(err);
                    });
                    this.connection.disconnect();
                    this.connection.end();
                    return resolve();
                });
            });
            this.connection.on('error', (err) => {
                return reject(err);
            });
        });
    }
};
AmqpPublisher = __decorate([
    injector_1.Injectable((publishRequisition) => publishRequisition.type === "amqp"),
    __metadata("design:paramtypes", [Object])
], AmqpPublisher);
exports.AmqpPublisher = AmqpPublisher;
