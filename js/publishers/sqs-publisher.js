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
}
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const AWS = __importStar(require("aws-sdk"));
let SqsPublisher = class SqsPublisher extends publisher_1.Publisher {
    constructor(publisherProperties) {
        super(publisherProperties);
        this.sqsSend = new AWS.SQS(publisherProperties.awsConfiguration);
        this.params = publisherProperties.messageParams || {};
        this.params.MessageBody = publisherProperties.payload;
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.sqsSend.sendMessage(this.params, (err, data) => {
                if (err) {
                    logger_1.Logger.error('Error publishing to SQS');
                    return reject(err);
                }
                else {
                    this.messageReceived = JSON.stringify(data);
                    logger_1.Logger.trace(`SQS send message result: ${JSON.stringify(data).substr(0, 128)}...`);
                    return resolve();
                }
            });
        });
    }
};
SqsPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'sqs' }),
    __metadata("design:paramtypes", [Object])
], SqsPublisher);
exports.SqsPublisher = SqsPublisher;
