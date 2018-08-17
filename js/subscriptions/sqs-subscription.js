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
const subscription_1 = require("./subscription");
const conditional_injector_1 = require("conditional-injector");
const AWS = __importStar(require("aws-sdk"));
const logger_1 = require("../loggers/logger");
let SqsSubscription = class SqsSubscription extends subscription_1.Subscription {
    constructor(subscriptionModel) {
        super(subscriptionModel);
        this.sqs = new AWS.SQS(subscriptionModel.awsConfiguration);
        this.params = subscriptionModel.messageParams;
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.sqs.receiveMessage(this.params, (err, data) => {
                logger_1.Logger.trace(`SQS got data: ${JSON.stringify(data, null, 2)}`);
                if (err) {
                    logger_1.Logger.error('Error receiving message from SQS');
                    return reject(err);
                }
                else if (data.Messages && data.Messages.length > 0) {
                    const stringifiedMessage = JSON.stringify(data.Messages[0], null, 2);
                    logger_1.Logger.debug('SQS got a message: ' + stringifiedMessage);
                    return resolve(data.Messages[0]);
                }
            });
        });
    }
    subscribe() {
        return Promise.resolve();
    }
};
SqsSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'sqs' }),
    __metadata("design:paramtypes", [Object])
], SqsSubscription);
exports.SqsSubscription = SqsSubscription;
