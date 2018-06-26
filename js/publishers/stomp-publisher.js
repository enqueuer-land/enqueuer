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
const Stomp = require('stomp-client');
let StompPublisher = class StompPublisher extends publisher_1.Publisher {
    constructor(publisherProperties) {
        super(publisherProperties);
        this.address = publisherProperties.address;
        this.port = publisherProperties.port;
        this.user = publisherProperties.user;
        this.password = publisherProperties.password;
        this.queue = publisherProperties.queue;
    }
    publish() {
        return new Promise((resolve, reject) => {
            const client = new Stomp(this.address, this.port, this.user, this.password);
            client.connect((sessionId) => {
                logger_1.Logger.debug(`Stomp publisher connected id ${sessionId}`);
                client.publish(this.queue, this.payload);
                resolve();
            }, (err) => {
                logger_1.Logger.error(`Error connecting to stomp to publish: ${err}`);
                reject(err);
            });
        });
    }
};
StompPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'stomp' }),
    __metadata("design:paramtypes", [Object])
], StompPublisher);
exports.StompPublisher = StompPublisher;
