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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const amqp = __importStar(require("amqp"));
let AmqpPublisher = class AmqpPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.options = publish.options;
        this.exchange = publish.exchange;
        this.routingKey = publish.routingKey;
        this.messageOptions = publish.messageOptions || {};
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection(this.options);
            this.connection.on('ready', () => {
                const exchange = this.connection.exchange(this.exchange, { confirm: true, passive: true });
                logger_1.Logger.debug(`Exchange to publish: ${this.exchange} created`);
                exchange.on('open', () => {
                    logger_1.Logger.debug(`Exchange ${this.exchange} is opened, publishing to routingKey ${this.routingKey}`);
                    exchange.publish(this.routingKey, this.payload, this.messageOptions, (errored, err) => {
                        logger_1.Logger.trace(`Exchange published callback`);
                        if (errored) {
                            return reject(err);
                        }
                        logger_1.Logger.debug(`Message published`);
                        this.connection.disconnect();
                        this.connection.end();
                        return resolve();
                    });
                });
            });
            this.connection.on('error', (err) => {
                return reject(err);
            });
        });
    }
};
AmqpPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'amqp' }),
    __metadata("design:paramtypes", [Object])
], AmqpPublisher);
exports.AmqpPublisher = AmqpPublisher;
