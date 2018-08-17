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
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const mqtt = __importStar(require("mqtt"));
let MqttPublisher = class MqttPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.brokerAddress = publish.brokerAddress;
        this.topic = publish.topic;
        this.options = publish.options || {};
        this.options.clientId = this.options.clientId || 'mqtt_' + (1 + Math.random() * 4294967295).toString(16);
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.connectClient()
                .then(client => {
                logger_1.Logger.debug(`Mqtt publishing in ${this.brokerAddress} - ${this.topic}: ${this.payload}`
                    .substr(0, 100).concat('...'));
                const toPublish = typeof this.payload == 'object' ? JSON.stringify(this.payload, null, 3) : this.payload;
                client.publish(this.topic, toPublish, (err) => {
                    if (err) {
                        logger_1.Logger.error(`Error publishing in ${this.brokerAddress} - ${this.topic}: ${err}`);
                        reject(err);
                    }
                });
                client.end();
                resolve();
            });
        });
    }
    connectClient() {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(this.brokerAddress, this.options);
            if (client.connected) {
                resolve(client);
            }
            else {
                client.on('connect', () => resolve(client));
            }
            client.on('error', (err) => {
                logger_1.Logger.error(`Error connecting to publish to mqtt ${err}`);
                reject(err);
            });
        });
    }
};
MqttPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'mqtt' }),
    __metadata("design:paramtypes", [Object])
], MqttPublisher);
exports.MqttPublisher = MqttPublisher;
