"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
class Subscription {
    constructor(subscriptionAttributes) {
        this.avoid = false;
        this.messageReceived = subscriptionAttributes.messageReceived;
        this.name = subscriptionAttributes.name;
        this.timeout = subscriptionAttributes.timeout;
        this.response = subscriptionAttributes.response;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
        this.onFinish = subscriptionAttributes.onFinish;
        this.avoid = subscriptionAttributes.avoid || false;
    }
    unsubscribe() {
        //do nothing
    }
    sendResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.warning(`Subscription of ${this.type} does not provide synchronous response`);
        });
    }
    onMessageReceivedTests() {
        return [];
    }
}
exports.Subscription = Subscription;
